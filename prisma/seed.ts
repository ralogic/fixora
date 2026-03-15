/**
 * Prisma seed script — creates realistic Indian demo users and bookings.
 * Run: npm run prisma:seed
 */

import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "123456";
const ADMIN_PASSWORD = "admin123";
const LEGACY_DEMO_USER_EMAILS = [
  "ankit@test.com",
  "priya@test.com",
  "mohan@fixora.in",
  "vikram@fixora.in",
];

async function hashPw(password: string) {
  return bcrypt.hash(password, 12);
}

function isMissingTableError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";
}

async function runIfTableExists(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
  }
}

async function cleanupLegacyDemoUsers() {
  const legacyUsers = await prisma.user.findMany({
    where: {
      email: {
        in: LEGACY_DEMO_USER_EMAILS,
      },
    },
    select: { id: true },
  });

  const legacyUserIds = legacyUsers.map((user) => user.id);

  const orderIds = await prisma.order.findMany({
    where: {
      OR: [
        { id: { startsWith: "booking_demo_" } },
        { customerId: { in: legacyUserIds } },
        { technicianId: { in: legacyUserIds } },
      ],
    },
    select: { id: true },
  });

  const legacyOrderIds = orderIds.map((order) => order.id);

  if (legacyOrderIds.length > 0) {
    await runIfTableExists(() => prisma.rating.deleteMany({ where: { orderId: { in: legacyOrderIds } } }));
    await runIfTableExists(() => prisma.orderEvent.deleteMany({ where: { orderId: { in: legacyOrderIds } } }));
    await runIfTableExists(() => prisma.assignmentAttempt.deleteMany({ where: { orderId: { in: legacyOrderIds } } }));
    await runIfTableExists(() => prisma.dispute.deleteMany({ where: { orderId: { in: legacyOrderIds } } }));
    await runIfTableExists(() => prisma.payment.deleteMany({ where: { orderId: { in: legacyOrderIds } } }));
    await runIfTableExists(() => prisma.location.deleteMany({ where: { orderId: { in: legacyOrderIds } } }));
    await prisma.order.deleteMany({ where: { id: { in: legacyOrderIds } } });
  }

  if (legacyUserIds.length > 0) {
    await runIfTableExists(() => prisma.technicianDocument.deleteMany({ where: { technicianId: { in: legacyUserIds } } }));
    await runIfTableExists(() => prisma.technicianBankDetails.deleteMany({ where: { technicianId: { in: legacyUserIds } } }));
    await prisma.technicianService.deleteMany({ where: { technicianId: { in: legacyUserIds } } });
    await runIfTableExists(() => prisma.notification.deleteMany({ where: { userId: { in: legacyUserIds } } }));
    await runIfTableExists(() => prisma.passwordResetToken.deleteMany({ where: { userId: { in: legacyUserIds } } }));
    await runIfTableExists(() => prisma.otpCode.deleteMany({ where: { userId: { in: legacyUserIds } } }));
    await runIfTableExists(() => prisma.auditLog.deleteMany({ where: { actorUserId: { in: legacyUserIds } } }));
    await prisma.address.deleteMany({ where: { userId: { in: legacyUserIds } } });
    await prisma.technician.deleteMany({ where: { id: { in: legacyUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: legacyUserIds } } });
  }
}

async function main() {
  console.log("Seeding Fixora demo data...");

  const [jaipur, delhi, mumbai] = await Promise.all([
    prisma.city.upsert({
      where: { slug: "jaipur" },
      update: { isActive: true },
      create: { name: "Jaipur", slug: "jaipur", isActive: true },
    }),
    prisma.city.upsert({
      where: { slug: "delhi" },
      update: { isActive: true },
      create: { name: "Delhi", slug: "delhi", isActive: true },
    }),
    prisma.city.upsert({
      where: { slug: "mumbai" },
      update: { isActive: true },
      create: { name: "Mumbai", slug: "mumbai", isActive: true },
    }),
  ]);

  const [zoneMalviya, zoneVaishali, zoneMansarovar] = await Promise.all([
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

  const [svcAcRepair, svcElectrician, svcPlumber, svcAppliance] = await Promise.all([
    prisma.service.upsert({
      where: { id: "svc_ac_repair" },
      update: {},
      create: {
        id: "svc_ac_repair",
        category: "ac-repair",
        name: "AC Repair",
        description: "Cooling issue diagnosis, service and gas refill",
        basePriceInPaise: 49900,
        estimatedDuration: 60,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_electrician" },
      update: {},
      create: {
        id: "svc_electrician",
        category: "electrician",
        name: "Electrician",
        description: "Wiring, MCB, fan, switch and light repairs",
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
        description: "Leak fixes, tap replacement and fitting work",
        basePriceInPaise: 34900,
        estimatedDuration: 45,
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
        description: "Washing machine, fridge and microwave repair",
        basePriceInPaise: 39900,
        estimatedDuration: 60,
        isActive: true,
      },
    }),
  ]);

  for (const category of ["electrician", "plumber", "ac-repair", "appliance"]) {
    await prisma.pricingRule.upsert({
      where: { cityId_category: { cityId: jaipur.id, category } },
      update: {},
      create: {
        cityId: jaipur.id,
        category,
        baseMultiplier: 1,
        rushMultiplier: 1.3,
      },
    });
  }

  await cleanupLegacyDemoUsers();

  const customerPasswordHash = await hashPw(DEMO_PASSWORD);
  const techPasswordHash = await hashPw(DEMO_PASSWORD);
  const adminPasswordHash = await hashPw(ADMIN_PASSWORD);

  const rahul = await prisma.user.upsert({
    where: { email: "rahul@test.com" },
    update: {
      name: "Rahul Sharma",
      phone: "9876543210",
      role: "CUSTOMER",
      cityId: jaipur.id,
      passwordHash: customerPasswordHash,
    },
    create: {
      id: "cust_rahul_sharma",
      name: "Rahul Sharma",
      email: "rahul@test.com",
      phone: "9876543210",
      role: "CUSTOMER",
      cityId: jaipur.id,
      passwordHash: customerPasswordHash,
      createdAt: new Date("2026-03-01T10:30:00.000Z"),
    },
  });

  await Promise.all([
    prisma.address.upsert({
      where: { id: "addr_cust_rahul_home" },
      update: {
        addressLine: "22 Nehru Nagar",
        landmark: "Rajasthan - 302001",
        cityId: jaipur.id,
        zoneId: zoneMalviya.id,
      },
      create: {
        id: "addr_cust_rahul_home",
        userId: rahul.id,
        cityId: jaipur.id,
        zoneId: zoneMalviya.id,
        label: "HOME",
        addressLine: "22 Nehru Nagar",
        landmark: "Rajasthan - 302001",
        floor: "2nd Floor",
        lat: 26.8478,
        lng: 75.8074,
      },
    }),
  ]);

  const rohitUser = await prisma.user.upsert({
    where: { email: "rohit@fixora.in" },
    update: {
      name: "Rohit Sharma",
      phone: "9811111111",
      role: "TECHNICIAN",
      cityId: jaipur.id,
      passwordHash: techPasswordHash,
    },
    create: {
      id: "tech_rohit_sharma",
      name: "Rohit Sharma",
      email: "rohit@fixora.in",
      phone: "9811111111",
      role: "TECHNICIAN",
      cityId: jaipur.id,
      passwordHash: techPasswordHash,
    },
  });

  await prisma.technician.upsert({
    where: { id: rohitUser.id },
    update: {
      verificationStatus: "VERIFIED",
      isOnline: true,
      avgRating: 4.8,
      completedJobs: 612,
      acceptanceRate: 0.93,
      primaryCityId: jaipur.id,
      experienceYears: 5,
      onboardingComplete: true,
      currentLat: 26.8502,
      currentLng: 75.8084,
      lastLocationAt: new Date(),
    },
    create: {
      id: rohitUser.id,
      verificationStatus: "VERIFIED",
      isOnline: true,
      serviceRadiusKm: 8,
      avgRating: 4.8,
      completedJobs: 612,
      acceptanceRate: 0.93,
      primaryCityId: jaipur.id,
      experienceYears: 5,
      toolsAvailable: true,
      bio: "AC specialist with 5 years of field experience.",
      workType: "HOME_SERVICE",
      currentLat: 26.8502,
      currentLng: 75.8084,
      lastLocationAt: new Date(),
      onboardingComplete: true,
    },
  });

  await prisma.technicianService.upsert({
    where: { technicianId_serviceId: { technicianId: rohitUser.id, serviceId: svcAcRepair.id } },
    update: {},
    create: { technicianId: rohitUser.id, serviceId: svcAcRepair.id },
  });

  await prisma.user.upsert({
    where: { email: "admin@fixora.com" },
    update: {
      name: "Fixora Admin",
      phone: "9000099999",
      role: "ADMIN",
      cityId: jaipur.id,
      passwordHash: adminPasswordHash,
    },
    create: {
      id: "admin_fixora_root",
      name: "Fixora Admin",
      email: "admin@fixora.com",
      phone: "9000099999",
      role: "ADMIN",
      cityId: jaipur.id,
      passwordHash: adminPasswordHash,
    },
  });

  const testUsersWithEmail = await prisma.user.findMany({
    where: {
      email: {
        in: ["admin@fixora.com", "rohit@fixora.in", "rahul@fixora.in", "customer@fixora.com"],
      },
    },
    select: { id: true, email: true, role: true },
  });

  for (const testUser of testUsersWithEmail) {
    if (!testUser.email) {
      continue;
    }

    const normalizedEmail = testUser.email.toLowerCase();
    const purpose = testUser.role === "TECHNICIAN" ? "TECHNICIAN_REGISTER" : "CUSTOMER_VERIFY";

    await prisma.otpCode.create({
      data: {
        userId: testUser.id,
        phone: normalizedEmail,
        purpose,
        code: "seed_verified",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        verifiedAt: new Date(),
        attempts: 0,
        lockedUntil: null,
      },
    });
  }

  await prisma.order.deleteMany({
    where: {
      id: {
        startsWith: "booking_demo_",
      },
    },
  });

  const bookingSeed = [
    {
      id: "booking_demo_1",
      customerId: rahul.id,
      technicianId: rohitUser.id,
      serviceId: svcAcRepair.id,
      cityId: jaipur.id,
      zoneId: zoneMalviya.id,
      issueType: "AC Repair",
      preferredTime: new Date("2026-03-20T10:00:00.000Z"),
      status: "PENDING" as const,
      estimatedAmountPaise: 49900,
      paymentStatus: "PENDING" as const,
    },
    {
      id: "booking_demo_2",
      customerId: rahul.id,
      technicianId: rohitUser.id,
      serviceId: svcAcRepair.id,
      cityId: jaipur.id,
      zoneId: zoneMalviya.id,
      issueType: "AC Service",
      preferredTime: new Date("2026-03-19T09:00:00.000Z"),
      status: "COMPLETED" as const,
      estimatedAmountPaise: 49900,
      finalAmountPaise: 54900,
      paymentStatus: "SUCCEEDED" as const,
      assignedAt: new Date("2026-03-19T08:15:00.000Z"),
      startedAt: new Date("2026-03-19T09:10:00.000Z"),
      completedAt: new Date("2026-03-19T10:05:00.000Z"),
    },
  ];

  for (const booking of bookingSeed) {
    await prisma.order.upsert({
      where: { id: booking.id },
      update: {
        customerId: booking.customerId,
        technicianId: booking.technicianId,
        serviceId: booking.serviceId,
        cityId: booking.cityId,
        zoneId: booking.zoneId,
        issueType: booking.issueType,
        preferredTime: booking.preferredTime,
        status: booking.status,
        estimatedAmountPaise: booking.estimatedAmountPaise,
        finalAmountPaise: booking.finalAmountPaise ?? null,
        paymentStatus: booking.paymentStatus,
        assignedAt: booking.assignedAt ?? null,
        startedAt: booking.startedAt ?? null,
        completedAt: booking.completedAt ?? null,
      },
      create: {
        id: booking.id,
        customerId: booking.customerId,
        technicianId: booking.technicianId,
        serviceId: booking.serviceId,
        cityId: booking.cityId,
        zoneId: booking.zoneId,
        issueType: booking.issueType,
        issueNotes: "Demo booking for workflow testing",
        preferredTime: booking.preferredTime,
        status: booking.status,
        estimatedAmountPaise: booking.estimatedAmountPaise,
        finalAmountPaise: booking.finalAmountPaise,
        paymentStatus: booking.paymentStatus,
        assignedAt: booking.assignedAt,
        startedAt: booking.startedAt,
        completedAt: booking.completedAt,
      },
    });
  }

  console.log("Demo data seed completed.");
  console.log("Customer demo: rahul@test.com / 123456");
  console.log("Technician demo: rohit@fixora.in / 123456");
  console.log("Admin: admin@fixora.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
