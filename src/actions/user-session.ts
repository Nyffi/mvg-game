"use server";

import { cookies } from "next/headers";
import * as Jose from "jose";

export async function createUserSession(payload: any) {
  const store = await cookies();
  console.log({ payload });
  store.set({
    name: "BLEIZE_AUTH",
    path: "/",
    value: payload,
    maxAge: 60 * 60 * 3,
    httpOnly: true,
    sameSite: "lax",
  });
}

export async function getUser() {
  const store = await cookies();
  const session = store.get("BLEIZE_AUTH");

  if (!session?.value) return null;

  const encoderSecret = new TextEncoder().encode(process.env.JWT_SECRET || "");
  const user = await Jose.jwtVerify(session.value, encoderSecret)
    .then(({ payload }) => payload)
    .catch(() => null);

  return user;
}

export async function deleteUserSession() {
  const store = await cookies();
  store.delete("BLEIZE_AUTH");
}
