import { prisma } from "@/lib/prism";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "enter all the fields" }, { status: 400 });
    }

    const oldUser = await prisma.user.findUnique({ where:  {email} });
    if (oldUser) {
      return NextResponse.json({ error: "User already Exists" }, { status: 400 });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    // const hashPassword = password;
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashPassword,
      },
    });
    if (newUser) {
      return NextResponse.json({ message: "User Created" }, { status: 201 });
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
