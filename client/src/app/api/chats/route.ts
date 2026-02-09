/**
 * Chats API Route
 * 
 * GET  /api/chats - Get all chats for authenticated user
 * POST /api/chats - Create a new chat
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { generateChatId } from "@/lib/generateId";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { CreateChatRequest } from "@/types/chat";

/**
 * GET /api/chats
 * Get all chats for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all chats for user, ordered by most recent
    const chats = await prisma.chat.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1, // Just get first message for preview
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chats
 * Create a new chat
 */
export async function POST(
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request body
    const body: CreateChatRequest = await request.json();

    // Generate unique chat ID
    const chatId = generateChatId();

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        id: chatId,
        userId: user.id,
        title: body.title || null,
      },
    });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
