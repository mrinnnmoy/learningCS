import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { emailQueue } from "@/lib/queues/emailQueue";
import { notificationQueue } from "@/lib/queues/notificationQueue";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { name?: string; email?: string };

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { message: "name and email are required" },
      { status: 400 },
    );
  }

  // 1. Save user
  const user = store.addUser(body.name.trim(), body.email.trim());

  // 2. Enqueue jobs on both queues simultaneously — do NOT await processing
  await Promise.all([
    emailQueue.add("welcome-email", {
      to: user.email,
      name: user.name,
      userId: user.id,
      type: "welcome",
    }),
    notificationQueue.add("welcome-notif", {
      userId: user.id,
      message: `Welcome to the platform, ${user.name}!`,
      type: "success",
    }),
  ]);

  // 3. Return immediately — workers are processing in background
  return NextResponse.json(
    { message: "User registered. Background jobs enqueued.", user },
    { status: 201 },
  );
}
