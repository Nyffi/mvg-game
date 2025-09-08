import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GameState, User } from "@/models";
import { rewardTokens } from "@/lib/game";

export async function POST(req: NextRequest) {
  try {
    const { roundId } = await req.json();
    if (!roundId)
      return NextResponse.json(
        { error: "roundId é obrigatório" },
        { status: 400 }
      );

    const client = await clientPromise;
    const db = client.db("data");

    const game = await db.collection("games").findOne({
      roundId,
    });

    if (!game)
      return NextResponse.json(
        { error: "Jogo não encontrado" },
        { status: 404 }
      );

    if (game.state !== "playing")
      return NextResponse.json(
        { error: "Jogo não está em andamento" },
        { status: 400 }
      );

    const { seed, nonce, _id, ...data } = game;
    const gameData = data as GameState;

    gameData.state = "finished";

    const tokensEarned = calculatePoints(gameData.score);
    // await db
    //   .collection<User>("users")
    //   .findOneAndUpdate(
    //     { _id: gameData.userId },
    //     { $inc: { tkn: tokensEarned } },
    //     { upsert: true, returnDocument: "after" }
    //   );

    const result = await rewardTokens(gameData.userId, tokensEarned);
    if (!result)
      return NextResponse.json(
        { error: "Erro ao dar recompensa" },
        { status: 500 }
      );

    return NextResponse.json(
      { success: true, data: { gameData, tokensEarned } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function calculatePoints(total: number): number {
  if (total > 21) return 0;
  if (total === 21) return 100;
  return Math.floor((total / 21) * 100);
}
