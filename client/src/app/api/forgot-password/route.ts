import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import crypto from "crypto";
import { render } from "@react-email/render"; 
import { ResetPasswordEmail } from "../../_components/emails/ResetPasswordEmail";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "Email sent" });
    }

    const token = crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 3600 * 1000); 

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    const emailHtml = await render(
      ResetPasswordEmail({ 
        resetLink, 
        userEmail: email 
      })
    );

    await resend.emails.send({
      from: "Graphe <onboarding@resend.dev>", 
      to: email, 
      subject: "Reset your Graphe password",
      html: emailHtml, 
    });

    return NextResponse.json({ message: "Email sent" });

  } catch (error) {
    console.log("FORGOT_PASSWORD_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}