import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prism";
import { clientSchema } from "@/lib/validations/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ message: "Session Expired" }, { status: 401 });
    }
    const body = await req.json();
    const result = clientSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 },
      );
    }
    const { name, email, company, status } = result.data;
    const client = await prisma.client.create({
      data: {
        name: name,
        email: email,
        company: company,
        status: status,
        userId: session.user.id,
      },
    });
    return NextResponse.json(
      { message: "Create Client success" },
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clients = await prisma.client.findMany({
    where: {
      userId: session.user.id,
    },
  });
  return NextResponse.json(clients);
}
