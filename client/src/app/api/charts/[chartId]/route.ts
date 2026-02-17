/**
 * Single Chart API Route
 *
 * GET    /api/charts/[chartId] - Get a single chart
 * PATCH  /api/charts/[chartId] - Update chart (styling, favorite status, etc.)
 * DELETE /api/charts/[chartId] - Delete a chart
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
  params: Promise<{ chartId: string }>;
}

/**
 * GET /api/charts/[chartId]
 * Get a single chart with full data
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { chartId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const chart = await prisma.chart.findFirst({
      where: {
        id: chartId,
        userId: user.id,
      },
    });

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    return NextResponse.json({ chart });
  } catch (error) {
    console.error("Error fetching chart:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/charts/[chartId]
 * Update chart properties
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { chartId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const existingChart = await prisma.chart.findFirst({
      where: {
        id: chartId,
        userId: user.id,
      },
    });

    if (!existingChart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    const body = await request.json();

    // Merge styling with existing if partial update
    let mergedStyling = undefined;
    if (body.styling !== undefined) {
      const existingStyling = (existingChart.styling as Record<string, unknown>) || {};
      mergedStyling = { ...existingStyling, ...body.styling };
    }

    const chart = await prisma.chart.update({
      where: { id: chartId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(mergedStyling !== undefined && { styling: mergedStyling }),
        ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
        ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
      },
    });

    return NextResponse.json({ chart });
  } catch (error) {
    console.error("Error updating chart:", error);
    return NextResponse.json(
      { error: "Failed to update chart" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/charts/[chartId]
 * Delete a chart
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { chartId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const existingChart = await prisma.chart.findFirst({
      where: {
        id: chartId,
        userId: user.id,
      },
    });

    if (!existingChart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    await prisma.chart.delete({
      where: { id: chartId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chart:", error);
    return NextResponse.json(
      { error: "Failed to delete chart" },
      { status: 500 }
    );
  }
}
