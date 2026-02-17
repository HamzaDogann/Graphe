/**
 * Messages API Route
 * 
 * POST /api/chats/[chatId]/messages - Add a new message to chat
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { CreateMessageRequest } from "@/types/chat";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

/**
 * POST /api/chats/[chatId]/messages
 * Add a new message to a chat
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { chatId } = await params;
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

    // Get chat to verify ownership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body: CreateMessageRequest = await request.json();

    // Validate message
    if (!body.role || !["user", "assistant"].includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid message role" },
        { status: 400 }
      );
    }

    // User messages must have content
    if (body.role === "user" && !body.content) {
      return NextResponse.json(
        { error: "User messages must have content" },
        { status: 400 }
      );
    }

    let chartId: string | null = null;

    // If assistant message has chartData, create Chart record first
    if (body.role === "assistant" && body.chartData) {
      const chartData = body.chartData;
      
      const chart = await prisma.chart.create({
        data: {
          userId: user.id,
          type: chartData.type,
          title: chartData.title || "Untitled Chart",
          description: chartData.description || null,
          datasetName: chartData.datasetInfo?.name || null,
          datasetExtension: chartData.datasetInfo?.extension || null,
          data: chartData.data as any,
          config: chartData.config as any,
          styling: chartData.styling as any,
          tableData: chartData.tableData as any || null,
          isFavorite: false, // Default: not favorited
        },
      });
      
      chartId = chart.id;
    }

    // Create message with chartId reference (not chartData JSON)
    const message = await prisma.message.create({
      data: {
        chatId,
        role: body.role,
        content: body.content || null,
        chartId: chartId,
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Auto-generate chat title from first user message if no title exists
    let chatTitle: string | null = null;
    if (!chat.title && body.role === "user" && body.content) {
      chatTitle = body.content.slice(0, 30) + (body.content.length > 30 ? "..." : "");
      await prisma.chat.update({
        where: { id: chatId },
        data: { title: chatTitle },
      });
    }

    return NextResponse.json({ message, chartId, chatTitle }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
