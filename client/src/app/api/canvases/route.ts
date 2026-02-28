/**
 * Canvases API Route
 * 
 * GET  /api/canvases - Get all canvases for authenticated user
 * POST /api/canvases - Create a new canvas
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { generateCanvasId } from "@/lib/generateId";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { CreateCanvasRequest, CanvasListItem } from "@/types/canvas";

/**
 * GET /api/canvases
 * Get all canvases for the authenticated user
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

    // Get all canvases for user, ordered by most recent
    const canvases = await prisma.canvas.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        elementCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform to CanvasListItem format
    const canvasList: CanvasListItem[] = canvases.map((canvas) => ({
      id: canvas.id,
      title: canvas.title,
      description: canvas.description || undefined,
      thumbnail: canvas.thumbnail || undefined,
      elementCount: canvas.elementCount,
      createdAt: canvas.createdAt,
      updatedAt: canvas.updatedAt,
    }));

    return NextResponse.json({ canvases: canvasList });
  } catch (error) {
    console.error("Error fetching canvases:", error);
    return NextResponse.json(
      { error: "Failed to fetch canvases" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/canvases
 * Create a new canvas
 */
export async function POST(request: NextRequest) {
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
    const body = (await request.json()) as CreateCanvasRequest;
    const { title, description } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate canvas ID
    const canvasId = generateCanvasId();

    // Create new canvas with default settings
    const canvas = await prisma.canvas.create({
      data: {
        id: canvasId,
        userId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        // Default page settings (A4 Portrait)
        pageWidth: 794,
        pageHeight: 1123,
        orientation: "portrait",
        background: "#ffffff",
        // Empty elements array
        elements: [],
        elementCount: 0,
      },
    });

    return NextResponse.json(
      {
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
          elements: canvas.elements,
          elementCount: canvas.elementCount,
          createdAt: canvas.createdAt,
          updatedAt: canvas.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating canvas:", error);
    return NextResponse.json(
      { error: "Failed to create canvas" },
      { status: 500 }
    );
  }
}
