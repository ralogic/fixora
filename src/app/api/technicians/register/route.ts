import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { fail, ok } from "@/lib/utils/response";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { WorkType } from "@prisma/client";
import { AuthorizationError, requireRole } from "@/server/shared/authz";
import { enforceSameOrigin } from "@/lib/security/csrf";

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Use service role key for server-side uploads if available, else fall back to publishable key
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
  return createSupabaseClient(url, key);
}

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
    if (!enforceSameOrigin(request)) {
      return fail("Invalid request origin", 403);
    }

    const sessionUser = await requireRole("TECHNICIAN");

    const formData = await request.formData();

    // ─── Parse JSON fields ──────────────────────────────────────────────────
    const personal = JSON.parse(formData.get("personal") as string);
    const professional = JSON.parse(formData.get("professional") as string);
    const locationData = JSON.parse(formData.get("location") as string);
    const banking = JSON.parse(formData.get("banking") as string);
    const normalizedWorkType =
      professional.workType === WorkType.HOME_SERVICE ||
      professional.workType === WorkType.SHOP ||
      professional.workType === WorkType.BOTH
        ? (professional.workType as WorkType)
        : WorkType.HOME_SERVICE;

    // ─── Basic server-side validation ───────────────────────────────────────
    if (!personal?.phone || !personal?.name || !personal?.email) {
      return fail("name, phone, and email are required", 422);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) {
      return fail("Invalid email address", 422);
    }

    if (sessionUser.email?.toLowerCase() !== String(personal.email).toLowerCase()) {
      return fail("Please verify the same email used for technician onboarding", 403);
    }

    if (!/^[6-9]\d{9}$/.test(personal.phone)) {
      return fail("Invalid phone number", 422);
    }

    const verifiedOtp = await prisma.otpCode.findFirst({
      where: {
        userId: sessionUser.id,
        phone: String(personal.email).toLowerCase(),
        purpose: "TECHNICIAN_REGISTER",
        verifiedAt: { not: null },
      },
      orderBy: { verifiedAt: "desc" },
    });

    if (!verifiedOtp) {
      return fail("Please verify your email with OTP before submitting", 403);
    }

    // ─── Check duplicate phone ──────────────────────────────────────────────
    const existing = await prisma.user.findFirst({
      where: {
        phone: personal.phone,
        NOT: {
          id: sessionUser.id,
        },
      },
      select: { id: true },
    });
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
    const supabase = getStorageClient();
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

    // ─── Create DB records in a transaction ─────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. User profile update (already created during OTP verification)
      const user = await tx.user.update({
        where: { id: sessionUser.id },
        data: {
          name: personal.name as string,
          phone: personal.phone as string,
          email: String(personal.email).toLowerCase(),
          cityId: city!.id,
        },
      });

      // 2. Technician
      const technician = await tx.technician.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          verificationStatus: "PENDING",
          serviceRadiusKm: locationData.radiusKm ?? 10,
          primaryCityId: city!.id,
          experienceYears: parseInt(professional.experienceYears, 10) || 0,
          skillsJson: professional.skills ?? [],
          toolsAvailable: professional.toolsAvailable ?? false,
          workType: normalizedWorkType,
          bio: professional.bio || null,
          profilePhotoUrl: uploadedUrls.profilePhoto ?? null,
          onboardingStep: 5,
          onboardingComplete: true,
        },
        update: {
          verificationStatus: "PENDING",
          serviceRadiusKm: locationData.radiusKm ?? 10,
          primaryCityId: city!.id,
          experienceYears: parseInt(professional.experienceYears, 10) || 0,
          skillsJson: professional.skills ?? [],
          toolsAvailable: professional.toolsAvailable ?? false,
          workType: normalizedWorkType,
          bio: professional.bio || null,
          profilePhotoUrl: uploadedUrls.profilePhoto ?? undefined,
          onboardingStep: 5,
          onboardingComplete: true,
          rejectionNote: null,
        },
      });

      // 3. TechnicianService mapping
      await tx.technicianService.upsert({
        where: {
          technicianId_serviceId: {
            technicianId: technician.id,
            serviceId: service!.id,
          },
        },
        create: { technicianId: technician.id, serviceId: service!.id },
        update: {},
      });

      // 4. Documents
      const docTypeMap: Record<string, "AADHAAR" | "PAN" | "PROFILE_PHOTO" | "CERTIFICATE"> = {
        aadhaar: "AADHAAR",
        pan: "PAN",
        profilePhoto: "PROFILE_PHOTO",
        certificate: "CERTIFICATE",
      };

      for (const [field, url] of Object.entries(uploadedUrls)) {
        await tx.technicianDocument.upsert({
          where: {
            technicianId_type: {
              technicianId: technician.id,
              type: docTypeMap[field],
            },
          },
          create: {
            technicianId: technician.id,
            type: docTypeMap[field],
            url,
            status: "PENDING",
          },
          update: {
            url,
            status: "PENDING",
            rejectionNote: null,
          },
        });
      }

      // 5. Bank details
      await tx.technicianBankDetails.upsert({
        where: { technicianId: technician.id },
        create: {
          technicianId: technician.id,
          accountName: banking.accountName as string,
          bankName: banking.bankName as string,
          accountNumber: banking.accountNumber as string,
          ifscCode: banking.ifscCode.toUpperCase() as string,
          upiId: banking.upiId || null,
        },
        update: {
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
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.message, error.statusCode);
    }
    return fail("Registration failed", 500, error);
  }
}
