/**
 * Prisma seed script — populates Jaipur city, service zones, services, and demo users.
 * Run: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

async function hashPw(pw: string): Promise<string> {
  return new Promise((resolve) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(pw, salt, 310000, 32, "sha256", (_, key) => {
      resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

async function main() {
  console.log("🌱  Seeding Fixora database...");

  // ── City ────────────────────────────────────────────────────────────
  const jaipur = await prisma.city.upsert({
    where: { slug: "jaipur" },
    update: {},
    create: { name: "Jaipur", slug: "jaipur", isActive: true },
  });
  console.log("  ✅  City: Jaipur");

  // ── Service zones ────────────────────────────────────────────────────
  const zones = await Promise.all([
    prisma.serviceZone.upsert({
      where: { id: "zone_jpr_malviya" },
      update: {},
      create: {
        id: "zone_jpr_malviya",
        cityId: jaipur.id,
        name: "Malviya Nagar",
        isActive: true,
        polygonJson: { type: "approximate", center: [26.846, 75.806] },
      },
    }),
    prisma.serviceZone.upsert({
      where: { id: "zone_jpr_vaishali" },
      update: {},
      create: {
        id: "zone_jpr_vaishali",
        cityId: jaipur.id,
        name: "Vaishali Nagar",
        isActive: true,
        polygonJson: { type: "approximate", center: [26.923, 75.738] },
      },
    }),
    prisma.serviceZone.upsert({
      where: { id: "zone_jpr_mansarovar" },
      update: {},
      create: {
        id: "zone_jpr_mansarovar",
        cityId: jaipur.id,
        name: "Mansarovar",
        isActive: true,
        polygonJson: { type: "approximate", center: [26.857, 75.771] },
      },
    }),
  ]);
  console.log(`  ✅  Zones: ${zones.map((z) => z.name).join(", ")}`);

  // ── Services ─────────────────────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: "svc_electrician" },
      update: {},
      create: {
        id: "svc_electrician",
        category: "electrician",
        name: "Electrician",
        description: "Wiring, switches, MCB, fan and light repairs",
        basePriceInPaise: 29900,
        estimatedDuration: 45,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_plumber" },
      update: {},
      create: {
        id: "svc_plumber",
        category: "plumber",
        name: "Plumber",
        description: "Leak fixes, tap replacement, bathroom fittings",
        basePriceInPaise: 34900,
        estimatedDuration: 45,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_ac_repair" },
      update: {},
      create: {
        id: "svc_ac_repair",
        category: "ac-repair",
        name: "AC Repair",
        description: "Cooling issue diagnosis, gas refill, service",
        basePriceInPaise: 49900,
        estimatedDuration: 60,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_appliance" },
      update: {},
      create: {
        id: "svc_appliance",
        category: "appliance",
        name: "Appliance Repair",
        description: "Washing machine, fridge, microwave support",
        basePriceInPaise: 39900,
        estimatedDuration: 60,
        isActive: true,
      },
    }),
  ]);
  console.log(`  ✅  Services: ${services.map((s) => s.name).join(", ")}`);

  // ── Demo customer ──────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: "demo_customer_jaipur" },
    update: {},
    create: {
      id: "demo_customer_jaipur",
      role: "CUSTOMER",
      name: "Demo Customer",
      phone: "+919876543210",
      email: "customer@fixora.in",
      passwordHash: await hashPw("password123"),
      cityId: jaipur.id,
    },
  });
  console.log("  ✅  Customer: Demo Customer");

  // ── Demo admin ────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: "admin_fixora_jaipur" },
    update: {},
    create: {
      id: "admin_fixora_jaipur",
      role: "ADMIN",
      name: "Fixora Admin",
      phone: "+919800000001",
      email: "admin@fixora.in",
      passwordHash: await hashPw("admin_secure_123"),
      cityId: jaipur.id,
    },
  });
  console.log("  ✅  Admin: Fixora Admin");

  // ── Demo technicians ─────────────────────────────────────────────
  const technicianSeedData = [
    {
      id: "usr_tech_rohit",
      name: "Rohit Sharma",
      phone: "+919811111111",
      email: "rohit@fixora.in",
      lat: 26.850,
      lng: 75.810,
      serviceIds: ["svc_electrician"],
      rating: 4.9,
      jobs: 612,
    },
    {
      id: "usr_tech_mohan",
      name: "Mohan Lal",
      phone: "+919812222222",
      email: "mohan@fixora.in",
      lat: 26.855,
      lng: 75.800,
      serviceIds: ["svc_plumber"],
      rating: 4.7,
      jobs: 441,
    },
    {
      id: "usr_tech_vikram",
      name: "Vikram Singh",
      phone: "+919813333333",
      email: "vikram@fixora.in",
      lat: 26.848,
      lng: 75.815,
      serviceIds: ["svc_ac_repair"],
      rating: 4.8,
      jobs: 333,
    },
  ];

  for (const t of technicianSeedData) {
    const pw = await hashPw("tech_pass_123");
    const user = await prisma.user.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        role: "TECHNICIAN",
        name: t.name,
        phone: t.phone,
        email: t.email,
        passwordHash: pw,
        cityId: jaipur.id,
      },
    });

    await prisma.technician.upsert({
      where: { id: user.id },
      update: {
        isOnline: true,
        currentLat: t.lat,
        currentLng: t.lng,
      },
      create: {
        id: user.id,
        verificationStatus: "VERIFIED",
        isOnline: true,
        serviceRadiusKm: 8,
        currentLat: t.lat,
        currentLng: t.lng,
        lastLocationAt: new Date(),
        avgRating: t.rating,
        completedJobs: t.jobs,
        acceptanceRate: 0.92,
        primaryCityId: jaipur.id,
      },
    });

    for (const serviceId of t.serviceIds) {
      await prisma.technicianService.upsert({
        where: {
          technicianId_serviceId: { technicianId: user.id, serviceId },
        },
        update: {},
        create: { technicianId: user.id, serviceId },
      });
    }

    console.log(`  ✅  Technician: ${t.name}`);
  }

  // ── Pricing rules ─────────────────────────────────────────────────
  for (const category of ["electrician", "plumber", "ac-repair", "appliance"]) {
    await prisma.pricingRule.upsert({
      where: { cityId_category: { cityId: jaipur.id, category } },
      update: {},
      create: {
        cityId: jaipur.id,
        category,
        baseMultiplier: 1.0,
        rushMultiplier: 1.3,
      },
    });
  }
  console.log("  ✅  Pricing rules: 4 categories");

  console.log("\n🎉  Seeding complete!\n");
  console.log("Demo accounts:");
  console.log("  Customer  customer@fixora.in  /  password123");
  console.log("  Admin     admin@fixora.in     /  admin_secure_123");
  console.log("  Technicians: rohit@fixora.in, mohan@fixora.in, vikram@fixora.in / tech_pass_123\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
