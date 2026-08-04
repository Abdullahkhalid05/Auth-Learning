import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prism";
import {  clientSchema } from "@/lib/validations/client";
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
    const del = await prisma.client.delete({
      where: { id: id, userId: session.user.id },
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
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Something went wrong" }, { status: 500});
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
  const body = await req.json();
  const schema = clientSchema.partial()
  const result = schema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error:  result.error.flatten()  },
      { status: 400 },
    );
  }
  const { name, email, company, status } = result.data;
  const client = await prisma.client.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!client) {
    return NextResponse.json({ message: "Client not found" }, { status: 404 });
  }

  await prisma.client.update({
    where: { id },
    data: {
      name,
      email,
      company,
      status,
    },
  });
}
