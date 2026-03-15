import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emails = [
    "admin@fixora.com",
    "rohit@fixora.in",
    "rahul@fixora.in",
    "customer@fixora.com",
  ];

  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true, role: true },
  });

  for (const user of users) {
    if (!user.email) continue;

    const normalizedEmail = user.email.toLowerCase();
    const purpose = user.role === "TECHNICIAN" ? "TECHNICIAN_REGISTER" : "CUSTOMER_VERIFY";

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        phone: normalizedEmail,
        purpose,
        code: "manual_verified",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        verifiedAt: new Date(),
        attempts: 0,
        lockedUntil: null,
      },
    });
  }

  console.log(`Marked ${users.length} test user(s) as verified`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
