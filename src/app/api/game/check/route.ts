import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUser } from "@/actions/user-session";

export async function GET(_: NextRequest) {
  try {
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db("data");

    const game = await db.collection("games").findOne({
      userId: user._id,
      state: "playing",
    });

    if (!game)
      return NextResponse.json(
        { error: "Nenhum jogo encontrado" },
        { status: 404 }
      );

    const { seed, nonce, ...gameData } = game;

    return NextResponse.json(
      { success: true, data: { gameData } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
