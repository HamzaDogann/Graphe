/**
 * Single Message API Route
 * 
 * PATCH  /api/chats/[chatId]/messages/[messageId] - Update message (styling, content)
 * DELETE /api/chats/[chatId]/messages/[messageId] - Delete a message
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { UpdateMessageRequest, StoredChartData } from "@/types/chat";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ chatId: string; messageId: string }>;
}

/**
 * PATCH /api/chats/[chatId]/messages/[messageId]
 * Update a message (typically for updating chart styling)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { chatId, messageId } = await params;
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

    // Get existing message
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (existingMessage.chatId !== chatId) {
      return NextResponse.json(
        { error: "Message does not belong to this chat" },
        { status: 400 }
      );
    }

    // Parse request body
    const body: UpdateMessageRequest = await request.json();

    // Prepare update data
    const updateData: Prisma.MessageUpdateInput = {};

    if (body.content !== undefined) {
      updateData.content = body.content;
    }

    // Merge chartData updates (for partial styling updates)
    if (body.chartData !== undefined) {
      const existingChartData = existingMessage.chartData as StoredChartData | null;
      
      if (existingChartData) {
        // Merge existing with new data
        const mergedData = {
          ...existingChartData,
          ...body.chartData,
          // Deep merge styling if provided
          styling: body.chartData.styling 
            ? { ...existingChartData.styling, ...body.chartData.styling }
            : existingChartData.styling,
        };
        updateData.chartData = JSON.parse(JSON.stringify(mergedData));
      } else {
        updateData.chartData = JSON.parse(JSON.stringify(body.chartData));
      }
    }

    // Update message
    const message = await prisma.message.update({
      where: { id: messageId },
      data: updateData,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chats/[chatId]/messages/[messageId]
 * Delete a message
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const { chatId, messageId } = await params;
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

    // Get existing message
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (existingMessage.chatId !== chatId) {
      return NextResponse.json(
        { error: "Message does not belong to this chat" },
        { status: 400 }
      );
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
