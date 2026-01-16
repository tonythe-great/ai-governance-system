import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const submissions = await prisma.aISystemSubmission.findMany({
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
    const submission = await prisma.aISystemSubmission.create({
      data: {
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
