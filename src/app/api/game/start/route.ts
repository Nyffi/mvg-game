import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Deck } from "@/lib/deck";
import type { Card } from "@/models";
import type { Counter } from "@/models/Collections";
import type { GameState } from "@/models/GameState";
import { getUser } from "@/actions/user-session";

const SEED = process.env.BLACKJACK_SEED;

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

    if (!SEED)
      return NextResponse.json({ error: "Seed não definida" }, { status: 500 });

    const client = await clientPromise;
    const db = client.db("data");

    const counter = await db
      .collection<Counter>("counters")
      .findOneAndUpdate(
        { _id: "blackjack_nonce" },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: "after" }
      );

    const nonce = counter?.value ?? 1;

    const deck = new Deck(SEED, nonce);
    const playerInitialCard = deck.drawCard() as Card;

    const gameData: GameState = {
      roundId: randomUUID(),
      userId: user._id as string,
      state: "playing",
      score: playerInitialCard.numericValue,
      playerCards: [playerInitialCard],
      createdAt: new Date(),
    };

    await db.collection("games").insertOne({ ...gameData, nonce, seed: SEED });
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
