import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { GameState } from "@/models";
import { rewardTokens } from "@/lib/game";
import { getUser } from "@/actions/user-session";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user)
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        {
          status: 403,
        }
      );

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

    const tokensEarned = calculatePoints(gameData.score);
    console.log("roundId: ", gameData.roundId);
    await db
      .collection("games")
      .findOneAndUpdate(
        { roundId: gameData.roundId },
        { $set: { state: "finished" } }
      );

    const result = await rewardTokens(gameData.userId, tokensEarned);
    if (!result)
      return NextResponse.json(
        { error: "Erro ao dar recompensa" },
        { status: 500 }
      );

    return NextResponse.json(
      {
        success: true,
        data: {
          gameData: { ...gameData, state: "finished", tknEarned: tokensEarned },
        },
      },
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
