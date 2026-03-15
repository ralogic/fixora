import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);
  const customerPasswordHash = await bcrypt.hash("Customer@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fixora.app" },
    update: {},
    create: {
      name: "Fixora Admin",
      email: "admin@fixora.app",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@fixora.app" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@fixora.app",
      role: "CUSTOMER",
      passwordHash: customerPasswordHash,
    },
  });

  const techUser = await prisma.user.upsert({
    where: { email: "tech@fixora.app" },
    update: {},
    create: {
      name: "Demo Technician",
      email: "tech@fixora.app",
      role: "TECHNICIAN",
      passwordHash: customerPasswordHash,
    },
  });

  await prisma.technician.upsert({
    where: { userId: techUser.id },
    update: {},
    create: {
      userId: techUser.id,
      category: "Electrician",
      experience: 5,
      rating: 4.8,
      reviewCount: 32,
      verified: true,
      online: true,
      latitude: 26.9124,
      longitude: 75.7873,
      serviceAreaKm: 15,
      idProofUrl: "https://example.com/id-proof.jpg",
      profilePhotoUrl: "https://example.com/profile-photo.jpg",
    },
  });

  console.info("Seed complete", { adminId: admin.id, customerId: customer.id, technicianUserId: techUser.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
