import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log("Usage: npx tsx prisma/seed-admin.ts <email>");
    console.log("\nThis will promote an existing user to ADMIN role.");
    console.log("\nExample:");
    console.log("  npx tsx prisma/seed-admin.ts admin@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email "${email}" not found.`);
    console.log("\nTo create a new admin user:");
    console.log("1. Sign up at /signup with the desired email");
    console.log("2. Run this script again to promote the user");
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`User "${email}" is already an ADMIN.`);
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`Successfully promoted "${email}" to ADMIN role.`);
  console.log(`Previous role: ${user.role}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
