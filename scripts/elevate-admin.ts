import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function elevateToAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`Successfully elevated ${user.email} to ADMIN role`);
    console.log(`User ID: ${user.id}`);
    console.log(`Name: ${user.name || "N/A"}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      console.error(`Error: No user found with email "${email}"`);
    } else {
      console.error("Error elevating user:", error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.log("Usage: npx tsx scripts/elevate-admin.ts <email>");
  console.log("Example: npx tsx scripts/elevate-admin.ts admin@example.com");
  process.exit(1);
}

elevateToAdmin(email);
