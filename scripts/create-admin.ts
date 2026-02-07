import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const email = "admin@governance.local";
  const password = "Admin123!";
  const name = "Admin User";

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      console.log(`User ${email} already exists.`);
      if (existing.role !== "ADMIN") {
        await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" },
        });
        console.log("Updated role to ADMIN.");
      }
      console.log("\nLogin credentials:");
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    console.log("Admin user created successfully!");
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log("\nLogin credentials:");
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
