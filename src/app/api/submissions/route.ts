import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.aISystemSubmission.findMany({
      where: { submittedById: session.user.id },
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submission = await prisma.aISystemSubmission.create({
      data: {
        submittedById: session.user.id,
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
