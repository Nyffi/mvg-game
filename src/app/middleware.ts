import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const store = await cookies();
  const session = store.get("session");
  if (!session?.value) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}
