import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@example.com";

async function getDemoUserId(): Promise<string | null> {
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });
  return demoUser?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getDemoUserId();

    if (!userId) {
      return NextResponse.json({ error: "Demo user not found" }, { status: 500 });
    }

    const submissions = await prisma.aISystemSubmission.findMany({
      where: { submittedById: userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        aiSystemName: true,
        vendor: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        submittedAt: true,
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const userId = await getDemoUserId();

    if (!userId) {
      return NextResponse.json({ error: "Demo user not found" }, { status: 500 });
    }

    const submission = await prisma.aISystemSubmission.create({
      data: {
        submittedById: userId,
        status: "DRAFT",
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
