import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      version: process.env.npm_package_version ?? "0.1.0",
      uptime: Math.floor(process.uptime()),
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: allOk ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
