import { type NextRequest, NextResponse } from "next/server";
import { createUserSession } from "@/actions/user-session";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  await createUserSession(token);
  return NextResponse.json({ message: "ok" });
}
