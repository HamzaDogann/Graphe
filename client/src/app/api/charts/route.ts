/**
 * Charts API Route
 *
 * GET  /api/charts - Get all favorite charts for authenticated user
 * POST /api/charts - Create a new chart
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface CreateChartRequest {
  type: "pie" | "bar" | "line" | "table";
  title: string;
  description?: string;
  datasetName?: string;
  datasetExtension?: string;
  data: unknown[];
  config: unknown;
  styling: unknown;
  tableData?: unknown;
  thumbnail?: string;
  isFavorite?: boolean;
  messageId?: string; // Optional: link to message
}

/**
 * GET /api/charts
 * Get all charts for the authenticated user (optionally filter by favorites)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for favorites filter
    const { searchParams } = new URL(request.url);
    const favoritesOnly = searchParams.get("favorites") === "true";

    const charts = await prisma.chart.findMany({
      where: {
        userId: user.id,
        ...(favoritesOnly ? { isFavorite: true } : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        datasetName: true,
        datasetExtension: true,
        thumbnail: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ charts });
  } catch (error) {
    console.error("Error fetching charts:", error);
    return NextResponse.json(
      { error: "Failed to fetch charts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/charts
 * Create a new chart
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body: CreateChartRequest = await request.json();

    const chart = await prisma.chart.create({
      data: {
        userId: user.id,
        type: body.type,
        title: body.title,
        description: body.description,
        datasetName: body.datasetName,
        datasetExtension: body.datasetExtension,
        data: body.data as any,
        config: body.config as any,
        styling: body.styling as any,
        tableData: body.tableData as any,
        thumbnail: body.thumbnail,
        isFavorite: body.isFavorite ?? false,
      },
    });

    // If messageId provided, link the chart to the message
    if (body.messageId) {
      await prisma.message.update({
        where: { id: body.messageId },
        data: { chartId: chart.id },
      });
    }

    return NextResponse.json({ chart }, { status: 201 });
  } catch (error) {
    console.error("Error creating chart:", error);
    return NextResponse.json(
      { error: "Failed to create chart" },
      { status: 500 }
    );
  }
}
