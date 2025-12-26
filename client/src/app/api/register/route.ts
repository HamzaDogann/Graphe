import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing Info", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name, 
        email,
        password: hashedPassword,
        image: `https://ui-avatars.com/api/?name=${name}&background=random`
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}