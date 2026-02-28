/**
 * Canvas API Route - Single Canvas Operations
 * 
 * GET    /api/canvases/[canvasId] - Get canvas by ID
 * PATCH  /api/canvases/[canvasId] - Update canvas
 * DELETE /api/canvases/[canvasId] - Delete canvas
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { UpdateCanvasRequest, CanvasElement } from "@/types/canvas";

interface RouteParams {
  params: Promise<{ canvasId: string }>;
}

/**
 * GET /api/canvases/[canvasId]
 * Get a single canvas by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { canvasId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get canvas
    const canvas = await prisma.canvas.findFirst({
      where: {
        id: canvasId,
        userId: user.id,
      },
    });

    if (!canvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    return NextResponse.json({
      canvas: {
        id: canvas.id,
        title: canvas.title,
        description: canvas.description,
        thumbnail: canvas.thumbnail,
        pageSettings: {
          width: canvas.pageWidth,
          height: canvas.pageHeight,
          orientation: canvas.orientation,
          background: canvas.background,
        },
        elements: (canvas.elements as unknown) as CanvasElement[],
        elementCount: canvas.elementCount,
        createdAt: canvas.createdAt,
        updatedAt: canvas.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching canvas:", error);
    return NextResponse.json(
      { error: "Failed to fetch canvas" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/canvases/[canvasId]
 * Update canvas (elements, settings, title, etc.)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { canvasId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if canvas exists and belongs to user
    const existingCanvas = await prisma.canvas.findFirst({
      where: {
        id: canvasId,
        userId: user.id,
      },
    });

    if (!existingCanvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // Parse request body
    const body = (await request.json()) as UpdateCanvasRequest;

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Update metadata if provided
    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.thumbnail !== undefined) {
      updateData.thumbnail = body.thumbnail;
    }

    // Update page settings if provided
    if (body.pageSettings) {
      if (body.pageSettings.width !== undefined) {
        updateData.pageWidth = body.pageSettings.width;
      }
      if (body.pageSettings.height !== undefined) {
        updateData.pageHeight = body.pageSettings.height;
      }
      if (body.pageSettings.orientation !== undefined) {
        updateData.orientation = body.pageSettings.orientation;
      }
      if (body.pageSettings.background !== undefined) {
        updateData.background = body.pageSettings.background;
      }
    }

    // Update elements if provided
    if (body.elements !== undefined) {
      updateData.elements = body.elements;
      updateData.elementCount = body.elements.length;
    }

    // Perform update
    const canvas = await prisma.canvas.update({
      where: { id: canvasId },
      data: updateData,
    });

    return NextResponse.json({
      canvas: {
        id: canvas.id,
        title: canvas.title,
        description: canvas.description,
        thumbnail: canvas.thumbnail,
        pageSettings: {
          width: canvas.pageWidth,
          height: canvas.pageHeight,
          orientation: canvas.orientation,
          background: canvas.background,
        },
        elements: (canvas.elements as unknown) as CanvasElement[],
        elementCount: canvas.elementCount,
        createdAt: canvas.createdAt,
        updatedAt: canvas.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating canvas:", error);
    return NextResponse.json(
      { error: "Failed to update canvas" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/canvases/[canvasId]
 * Delete a canvas
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { canvasId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if canvas exists and belongs to user
    const existingCanvas = await prisma.canvas.findFirst({
      where: {
        id: canvasId,
        userId: user.id,
      },
    });

    if (!existingCanvas) {
      return NextResponse.json({ error: "Canvas not found" }, { status: 404 });
    }

    // Delete canvas
    await prisma.canvas.delete({
      where: { id: canvasId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting canvas:", error);
    return NextResponse.json(
      { error: "Failed to delete canvas" },
      { status: 500 }
    );
  }
}
