import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function GET(_: NextRequest, props: Props) {
  try {
    const { userId } = await props.params;
    if (!userId)
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );

    const client = await clientPromise;
    const db = client.db("data");

    const game = await db.collection("games").findOne({
      userId,
      state: "playing",
    });

    if (!game)
      return NextResponse.json(
        { error: "Nenhum jogo encontrado" },
        { status: 404 }
      );

    const { seed, nonce, ...data } = game;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
