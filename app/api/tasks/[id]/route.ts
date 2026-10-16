import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prism";
import { taskScheme } from "@/lib/validations/task";
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
    await prisma.task.delete({
      where: { id: id, project: { userId: session.user.id } },
    });
    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
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
  try {
    const body = await req.json();
    const schema = taskScheme.partial();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }
    const { title, status, projectId } = result.data;

    const task = await prisma.task.findFirst({
      where: { id: id, project: { userId: session.user.id } },
    });
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.user.id },
      });
      if (!project) {
        return NextResponse.json(
          { message: "Project not found" },
          { status: 404 },
        );
      }
    }

    const update = await prisma.task.update({
      where: { id },
      data: {
        title,
        status,
        projectId,
      },
      include: { project: { select: { title: true } } },
    });
    return NextResponse.json(update, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}