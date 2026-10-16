import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prism";
import { taskScheme } from "@/lib/validations/task";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ message: "Session Expired" }, { status: 401 });
    }
    const body = await req.json();
    const result = taskScheme.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }
    const { title, status, projectId } = result.data;
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }
    const task = await prisma.task.create({
      data: {
        title: title,
        status: status,
        projectId: projectId,
      },
      include: { project: { select: { title: true } } },
    });
    return NextResponse.json(
      { message: "task created", task },
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

export async function GET(req: Request) {

    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ message: "Session Expired" }, { status: 401 });
    }
    const tasks = await prisma.task.findMany({
      where: {
        project: { userId: session.user.id },
      },
      include: { project: { select: { title: true } } },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(tasks);
}
