/**
 * Prisma seed script — creates realistic Indian demo users and bookings.
 * Run: npm run prisma:seed
 */

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "123456";
const ADMIN_PASSWORD = "admin123";

async function hashPw(password: string) {
  return bcrypt.hash(password, 12);
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

  const ankit = await prisma.user.upsert({
    where: { email: "ankit@test.com" },
    update: {
      name: "Ankit Verma",
      phone: "9876543211",
      role: "CUSTOMER",
      cityId: delhi.id,
      passwordHash: customerPasswordHash,
    },
    create: {
      id: "cust_ankit_verma",
      name: "Ankit Verma",
      email: "ankit@test.com",
      phone: "9876543211",
      role: "CUSTOMER",
      cityId: delhi.id,
      passwordHash: customerPasswordHash,
      createdAt: new Date("2026-03-02T08:45:00.000Z"),
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya@test.com" },
    update: {
      name: "Priya Singh",
      phone: "9876543212",
      role: "CUSTOMER",
      cityId: mumbai.id,
      passwordHash: customerPasswordHash,
    },
    create: {
      id: "cust_priya_singh",
      name: "Priya Singh",
      email: "priya@test.com",
      phone: "9876543212",
      role: "CUSTOMER",
      cityId: mumbai.id,
      passwordHash: customerPasswordHash,
      createdAt: new Date("2026-03-03T06:20:00.000Z"),
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
    prisma.address.upsert({
      where: { id: "addr_cust_ankit_home" },
      update: {
        addressLine: "14 Lajpat Nagar",
        landmark: "Delhi - 110024",
        cityId: delhi.id,
      },
      create: {
        id: "addr_cust_ankit_home",
        userId: ankit.id,
        cityId: delhi.id,
        label: "HOME",
        addressLine: "14 Lajpat Nagar",
        landmark: "Delhi - 110024",
        floor: "Ground",
        lat: 28.5672,
        lng: 77.2436,
      },
    }),
    prisma.address.upsert({
      where: { id: "addr_cust_priya_home" },
      update: {
        addressLine: "8 Andheri East",
        landmark: "Maharashtra - 400069",
        cityId: mumbai.id,
      },
      create: {
        id: "addr_cust_priya_home",
        userId: priya.id,
        cityId: mumbai.id,
        label: "HOME",
        addressLine: "8 Andheri East",
        landmark: "Maharashtra - 400069",
        floor: "5th Floor",
        lat: 19.1136,
        lng: 72.8697,
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

  const mohanUser = await prisma.user.upsert({
    where: { email: "mohan@fixora.in" },
    update: {
      name: "Mohan Lal",
      phone: "9812222222",
      role: "TECHNICIAN",
      cityId: jaipur.id,
      passwordHash: techPasswordHash,
    },
    create: {
      id: "tech_mohan_lal",
      name: "Mohan Lal",
      email: "mohan@fixora.in",
      phone: "9812222222",
      role: "TECHNICIAN",
      cityId: jaipur.id,
      passwordHash: techPasswordHash,
    },
  });

  const vikramUser = await prisma.user.upsert({
    where: { email: "vikram@fixora.in" },
    update: {
      name: "Vikram Singh",
      phone: "9813333333",
      role: "TECHNICIAN",
      cityId: jaipur.id,
      passwordHash: techPasswordHash,
    },
    create: {
      id: "tech_vikram_singh",
      name: "Vikram Singh",
      email: "vikram@fixora.in",
      phone: "9813333333",
      role: "TECHNICIAN",
      cityId: jaipur.id,
      passwordHash: techPasswordHash,
    },
  });

  await Promise.all([
    prisma.technician.upsert({
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
    }),
    prisma.technician.upsert({
      where: { id: mohanUser.id },
      update: {
        verificationStatus: "VERIFIED",
        isOnline: true,
        avgRating: 4.7,
        completedJobs: 441,
        acceptanceRate: 0.95,
        primaryCityId: jaipur.id,
        experienceYears: 7,
        onboardingComplete: true,
        currentLat: 26.8581,
        currentLng: 75.7708,
        lastLocationAt: new Date(),
      },
      create: {
        id: mohanUser.id,
        verificationStatus: "VERIFIED",
        isOnline: true,
        serviceRadiusKm: 10,
        avgRating: 4.7,
        completedJobs: 441,
        acceptanceRate: 0.95,
        primaryCityId: jaipur.id,
        experienceYears: 7,
        toolsAvailable: true,
        bio: "Residential electrician for rewiring and fault diagnostics.",
        workType: "HOME_SERVICE",
        currentLat: 26.8581,
        currentLng: 75.7708,
        lastLocationAt: new Date(),
        onboardingComplete: true,
      },
    }),
    prisma.technician.upsert({
      where: { id: vikramUser.id },
      update: {
        verificationStatus: "VERIFIED",
        isOnline: true,
        avgRating: 4.8,
        completedJobs: 333,
        acceptanceRate: 0.9,
        primaryCityId: jaipur.id,
        experienceYears: 4,
        onboardingComplete: true,
        currentLat: 26.9243,
        currentLng: 75.7389,
        lastLocationAt: new Date(),
      },
      create: {
        id: vikramUser.id,
        verificationStatus: "VERIFIED",
        isOnline: true,
        serviceRadiusKm: 7,
        avgRating: 4.8,
        completedJobs: 333,
        acceptanceRate: 0.9,
        primaryCityId: jaipur.id,
        experienceYears: 4,
        toolsAvailable: true,
        bio: "Plumbing expert for leak repairs and bathroom fittings.",
        workType: "HOME_SERVICE",
        currentLat: 26.9243,
        currentLng: 75.7389,
        lastLocationAt: new Date(),
        onboardingComplete: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.technicianService.upsert({
      where: { technicianId_serviceId: { technicianId: rohitUser.id, serviceId: svcAcRepair.id } },
      update: {},
      create: { technicianId: rohitUser.id, serviceId: svcAcRepair.id },
    }),
    prisma.technicianService.upsert({
      where: { technicianId_serviceId: { technicianId: mohanUser.id, serviceId: svcElectrician.id } },
      update: {},
      create: { technicianId: mohanUser.id, serviceId: svcElectrician.id },
    }),
    prisma.technicianService.upsert({
      where: { technicianId_serviceId: { technicianId: vikramUser.id, serviceId: svcPlumber.id } },
      update: {},
      create: { technicianId: vikramUser.id, serviceId: svcPlumber.id },
    }),
  ]);

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
      customerId: ankit.id,
      technicianId: mohanUser.id,
      serviceId: svcElectrician.id,
      cityId: jaipur.id,
      zoneId: zoneMansarovar.id,
      issueType: "Electrician",
      preferredTime: new Date("2026-03-20T13:30:00.000Z"),
      status: "ASSIGNED" as const,
      estimatedAmountPaise: 29900,
      paymentStatus: "PENDING" as const,
      assignedAt: new Date("2026-03-20T12:45:00.000Z"),
    },
    {
      id: "booking_demo_3",
      customerId: priya.id,
      technicianId: vikramUser.id,
      serviceId: svcPlumber.id,
      cityId: jaipur.id,
      zoneId: zoneVaishali.id,
      issueType: "Plumber",
      preferredTime: new Date("2026-03-19T09:00:00.000Z"),
      status: "COMPLETED" as const,
      estimatedAmountPaise: 34900,
      finalAmountPaise: 37900,
      paymentStatus: "SUCCEEDED" as const,
      assignedAt: new Date("2026-03-19T08:15:00.000Z"),
      startedAt: new Date("2026-03-19T09:10:00.000Z"),
      completedAt: new Date("2026-03-19T10:05:00.000Z"),
    },
    {
      id: "booking_demo_4",
      customerId: rahul.id,
      technicianId: mohanUser.id,
      serviceId: svcElectrician.id,
      cityId: jaipur.id,
      zoneId: zoneMalviya.id,
      issueType: "Electrician",
      preferredTime: new Date("2026-03-21T16:30:00.000Z"),
      status: "ASSIGNED" as const,
      estimatedAmountPaise: 32900,
      paymentStatus: "PENDING" as const,
      assignedAt: new Date("2026-03-21T15:45:00.000Z"),
    },
    {
      id: "booking_demo_5",
      customerId: ankit.id,
      technicianId: rohitUser.id,
      serviceId: svcAppliance.id,
      cityId: jaipur.id,
      zoneId: zoneMansarovar.id,
      issueType: "Appliance Repair",
      preferredTime: new Date("2026-03-22T11:00:00.000Z"),
      status: "PENDING" as const,
      estimatedAmountPaise: 39900,
      paymentStatus: "PENDING" as const,
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
  console.log("Customers: rahul@test.com, ankit@test.com, priya@test.com / 123456");
  console.log("Technicians: rohit@fixora.in, mohan@fixora.in, vikram@fixora.in / 123456");
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
