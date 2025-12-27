import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // 1. Token veritabanında var mı?
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return new NextResponse("Invalid token", { status: 400 });
    }

    // 2. Token süresi dolmuş mu?
    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return new NextResponse("Token expired", { status: 400 });
    }

    // 3. Kullanıcıyı bul
    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // 4. Şifreyi Hashle ve Güncelle
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    // 5. Token'ı sil (Güvenlik: Token tekrar kullanılamaz)
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return NextResponse.json({ message: "Password updated" });

  } catch (error) {
    console.log("RESET_PASSWORD_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}