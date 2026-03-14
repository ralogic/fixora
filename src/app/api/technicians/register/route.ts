import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { createClient } from "@/utils/supabase/server";
import bcrypt from "bcryptjs";

/**
 * POST /api/technicians/register
 *
 * Accepts multipart/form-data with:
 *   personal      — JSON string { name, phone, email, password, city, area }
 *   professional  — JSON string { serviceCategory, experienceYears, skills[], toolsAvailable, workType, bio }
 *   location      — JSON string { city, radiusKm }
 *   banking       — JSON string { accountName, bankName, accountNumber, ifscCode, upiId }
 *   aadhaar       — File (required)
 *   pan           — File (required)
 *   profilePhoto  — File (required)
 *   certificate   — File (optional)
 *
 * Creates:
 *   User (role = TECHNICIAN)
 *   Technician (verificationStatus = PENDING)
 *   TechnicianDocument entries (AADHAAR, PAN, PROFILE_PHOTO, optionally CERTIFICATE)
 *   TechnicianBankDetails
 *   TechnicianService mapping
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ─── Parse JSON fields ──────────────────────────────────────────────────
    const personal = JSON.parse(formData.get("personal") as string);
    const professional = JSON.parse(formData.get("professional") as string);
    const locationData = JSON.parse(formData.get("location") as string);
    const banking = JSON.parse(formData.get("banking") as string);

    // ─── Basic server-side validation ───────────────────────────────────────
    if (!personal?.phone || !personal?.name || !personal?.password) {
      return fail("name, phone, and password are required", 422);
    }
    if (!/^[6-9]\d{9}$/.test(personal.phone)) {
      return fail("Invalid phone number", 422);
    }
    if ((personal.password as string).length < 8) {
      return fail("Password must be at least 8 characters", 422);
    }

    // ─── Check duplicate phone ──────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { phone: personal.phone } });
    if (existing) {
      return fail("A user with this phone number already exists", 409);
    }

    // ─── Resolve city ────────────────────────────────────────────────────────
    const citySlug = (locationData.city || personal.city).toLowerCase().replace(/\s+/g, "-");
    let city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      city = await prisma.city.create({
        data: { name: locationData.city || personal.city, slug: citySlug },
      });
    }

    // ─── Resolve service (or create a placeholder) ───────────────────────────
    const categoryKey = professional.serviceCategory as string;
    let service = await prisma.service.findFirst({ where: { category: categoryKey, isActive: true } });
    if (!service) {
      service = await prisma.service.create({
        data: {
          id: `svc_${categoryKey.replace(/-/g, "_")}`,
          category: categoryKey,
          name: categoryKey.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          description: `${categoryKey} service`,
          basePriceInPaise: 29900,
          estimatedDuration: 60,
        },
      });
    }

    // ─── Upload documents to Supabase Storage ────────────────────────────────
    const supabase = await createClient();
    const docFields = ["aadhaar", "pan", "profilePhoto", "certificate"] as const;
    const uploadedUrls: Partial<Record<(typeof docFields)[number], string>> = {};

    for (const field of docFields) {
      const file = formData.get(field) as File | null;
      if (!file) continue;

      // Validate file type & size server-side
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        return fail(`Invalid file type for ${field}`, 422);
      }
      if (file.size > 5 * 1024 * 1024) {
        return fail(`${field} must be under 5 MB`, 422);
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `technicians/${personal.phone}/${field}_${Date.now()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

      if (uploadError) {
        // Non-fatal for non-required docs
        if (field !== "certificate") {
          return fail(`Failed to upload ${field}: ${uploadError.message}`, 500);
        }
        continue;
      }

      const { data: publicData } = supabase.storage.from("documents").getPublicUrl(path);
      uploadedUrls[field] = publicData.publicUrl;
    }

    // ─── Hash password ───────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(personal.password as string, 12);

    // ─── Create DB records in a transaction ─────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. User
      const user = await tx.user.create({
        data: {
          role: "TECHNICIAN",
          name: personal.name as string,
          phone: personal.phone as string,
          email: personal.email || null,
          passwordHash,
          cityId: city!.id,
        },
      });

      // 2. Technician
      const technician = await tx.technician.create({
        data: {
          id: user.id,
          verificationStatus: "PENDING",
          serviceRadiusKm: locationData.radiusKm ?? 10,
          primaryCityId: city!.id,
          experienceYears: parseInt(professional.experienceYears, 10) || 0,
          skillsJson: professional.skills ?? [],
          toolsAvailable: professional.toolsAvailable ?? false,
          workType: (professional.workType as string) ?? "HOME_SERVICE",
          bio: professional.bio || null,
          profilePhotoUrl: uploadedUrls.profilePhoto ?? null,
          onboardingStep: 5,
          onboardingComplete: true,
        },
      });

      // 3. TechnicianService mapping
      await tx.technicianService.create({
        data: { technicianId: technician.id, serviceId: service!.id },
      });

      // 4. Documents
      const docTypeMap: Record<string, "AADHAAR" | "PAN" | "PROFILE_PHOTO" | "CERTIFICATE"> = {
        aadhaar: "AADHAAR",
        pan: "PAN",
        profilePhoto: "PROFILE_PHOTO",
        certificate: "CERTIFICATE",
      };

      for (const [field, url] of Object.entries(uploadedUrls)) {
        await tx.technicianDocument.create({
          data: {
            technicianId: technician.id,
            type: docTypeMap[field],
            url,
            status: "PENDING",
          },
        });
      }

      // 5. Bank details
      await tx.technicianBankDetails.create({
        data: {
          technicianId: technician.id,
          accountName: banking.accountName as string,
          bankName: banking.bankName as string,
          accountNumber: banking.accountNumber as string,
          ifscCode: banking.ifscCode.toUpperCase() as string,
          upiId: banking.upiId || null,
        },
      });

      return { userId: user.id, technicianId: technician.id };
    });

    return ok(
      {
        technicianId: result.technicianId,
        message: "Registration successful. Your profile is under review.",
      },
      201,
    );
  } catch (error) {
    return fail("Registration failed", 500, error);
  }
}
