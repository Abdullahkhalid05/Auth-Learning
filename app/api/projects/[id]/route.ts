import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prism";
import { projectSchema } from "@/lib/validations/project";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ message: "Session Expired" }, { status: 401 });
  }
  try {
    const del = await prisma.project.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
    return NextResponse.json(
      { message: "Client deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ message: "Session Expired" }, { status: 401 });
  }
  const body = await req.json()
  const schema = projectSchema.partial()
  const result = schema.safeParse(body)

   if (!result.success) {
    return NextResponse.json(
      { error:  result.error.flatten()  },
      { status: 400 },
    );
  }
 const { title, description, budget, status } = result.data;
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!project) {
    return NextResponse.json({ message: "project not found" }, { status: 404 });
  }

 const update = await prisma.project.update({
    where: { id },
    data: {
      title,
      description,
      budget,
      status,
    },
  });
  return NextResponse.json(update, { status: 200 });
}
