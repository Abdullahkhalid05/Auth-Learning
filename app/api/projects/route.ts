import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prism";
import { projectSchema } from "@/lib/validations/project";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ message: "Session Expired" }, { status: 401 });
    }

    const body = await req.json();
    const result = projectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }

    const { title, description, status, budget, clientId } = result.data;

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: session.user.id,
      },
    });
    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 },
      );
    }

    const project = await prisma.project.create({
      data: {
        title: title,
        description: description,
        status: status,
        budget: budget,
        clientId: clientId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Project created", project },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}