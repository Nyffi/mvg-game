import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Deck } from "@/lib/deck";
import type { Card, GameState } from "@/models";
import { getUser } from "@/actions/user-session";

export async function POST(req: NextRequest) {
  try {
    // console.log(getUser);
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

    const deck = new Deck(seed, nonce);
    for (const _ of data.playerCards) {
      deck.drawCard();
    }

    const newCard = deck.drawCard() as Card;
    if (!newCard)
      return NextResponse.json(
        { error: "Não foi possível tirar uma nova carta" },
        { status: 500 }
      );

    gameData.playerCards.push(newCard);
    gameData.score = deck.calculateHandTotal(gameData.playerCards);

    if (gameData.score > 21) {
      gameData.state = "bust";
    }

    await db
      .collection("games")
      .updateOne(
        { _id },
        { $set: gameData },
        { session: client.startSession() }
      );

    return NextResponse.json(
      { success: true, data: { gameData: { ...gameData } } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
