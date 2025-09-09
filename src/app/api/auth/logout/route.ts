import { NextResponse, type NextRequest } from "next/server";
import { deleteUserSession } from "@/actions/user-session";

export async function POST(req: NextRequest) {
  await deleteUserSession();
  return NextResponse.json({ message: "ok" });
}
