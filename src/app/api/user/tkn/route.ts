import { getUser } from "@/actions/user-session";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user)
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        {
          status: 403,
        }
      );

    const client = await clientPromise;
    const db = client.db("data");

    const userObjectId = new ObjectId(user._id as string);

    const userData = await db
      .collection("users")
      .findOne({ _id: userObjectId });

    if (!userData)
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );

    const { tkn } = userData;

    return NextResponse.json({ success: true, data: { tkn } });
  } catch (error) {}
}
