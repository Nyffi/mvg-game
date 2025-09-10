"use client";

import { useEffect, useState } from "react";
import type { Card, GameState } from "@/models";
import { useRouter } from "next/navigation";

export default function BlackjackGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [userTkn, setUserTkn] = useState<number>(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useEffect(() => {
    callAPI("check");
    fetchUserTkn();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    router.push("/");
  };

  const callAPI = async (endpoint: string, data: any = {}) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/game/${endpoint}`, {
        method: endpoint.startsWith("check") ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: endpoint.startsWith("check") ? null : JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Request failed");
      }

      setGameState(result.data.gameData);
      return result.data.gameData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error(`API Error (${endpoint}):`, err);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    callAPI("start");
  };

  const hit = () => {
    if (gameState?.roundId) {
      callAPI("hit", { roundId: gameState.roundId });
    }
  };

  const stand = () => {
    if (gameState?.roundId) {
      callAPI("stand", { roundId: gameState.roundId });
    }
  };

  const fetchUserTkn = async () => {
    const response = await fetch("/api/balance").then((res) => res.json());
    if (!response.success) {
      setError(response.error);
      return;
    }
    setUserTkn(response.data.tkn);
  };

  const getCardDisplay = (card: Card): string => {
    const suitSymbols: Record<string, string> = {
      "♥": "♥️",
      "♦": "♦️",
      "♣": "♣️",
      "♠": "♠️",
    };
    return `${card.value} ${suitSymbols[card.suit]}`;
  };

  const getStateMessage = (state: string): string => {
    const stateMessages: Record<string, string> = {
      playing: "É a sua vez!",
      bust: "Brutal! Passou de 21.",
      finished: "Acabou o jogo!",
    };
    return stateMessages[state] || "Pronto para jogar?";
  };

  const getStateColor = (state: string): string => {
    const stateColors: Record<string, string> = {
      playing: "text-blue-600",
      bust: "text-red-600",
      finished: "text-green-600",
    };
    return stateColors[state] || "text-gray-600";
  };

  const canHit = gameState?.state === "playing" && !loading;
  const canStand = gameState?.state === "playing" && !loading;
  const canStart =
    (!gameState ||
      gameState.state === "bust" ||
      gameState.state === "finished") &&
    !loading;

  console.log(gameState?.tknEarned);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg relative">
      <div className="absolute right-10 top-6 flex flex-col gap-2">
        {/* <button
          type="button"
          disabled={true}
          className="bg-gray-800 px-3 py-1 rounded-2xl cursor-pointer hover:bg-gray-700"
          onClick={() => router.push("http://localhost:4000")}
        >
          Loja
        </button> */}
        <button
          type="button"
          className="bg-gray-800 px-3 py-1 rounded-2xl cursor-pointer hover:bg-gray-700"
          onClick={() => logout()}
        >
          Sair
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-200 mb-2">
          == Blackjack ==
        </h1>
        <p className="text-gray-400">Chegue o mais perto de 21 sem passar!</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{userTkn || 0}</div>
          <div className="text-sm text-gray-200">Seus TKN</div>
        </div>
        {gameState?.tknEarned && (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {gameState?.tknEarned}
            </div>
            <div className="text-sm text-gray-200">TKN Ganhos</div>
          </div>
        )}
      </div>

      {gameState && (
        <div className="mb-6">
          <div className="text-center mb-4">
            <div
              className={`text-lg font-semibold ${getStateColor(
                gameState.state
              )}`}
            >
              {getStateMessage(gameState.state)}
            </div>
            <div className="text-3xl font-bold text-gray-200 mt-2">
              Total: {gameState.score}
            </div>
          </div>

          {gameState?.playerCards?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-400 mb-3 text-center">
                Suas cartas
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {gameState.playerCards.map((card) => (
                  <div
                    key={`${card.value}${card.suit}`}
                    className="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-center shadow-md min-w-[60px]"
                  >
                    <div className="text-lg font-bold text-black">
                      {getCardDisplay(card)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => startGame()}
          disabled={!canStart}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            canStart
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading && !gameState ? "Iniciando..." : "Iniciar"}
        </button>

        <button
          type="button"
          onClick={hit}
          disabled={!canHit}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            canHit
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading && gameState?.state === "playing"
            ? "Comprando carta..."
            : "Compra"}
        </button>

        <button
          type="button"
          onClick={() => {
            stand();
            fetchUserTkn();
          }}
          disabled={!canStand}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            canStand
              ? "bg-orange-600 hover:bg-orange-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading && gameState?.state === "playing" ? "Parando..." : "Pare"}
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-400 mb-2">Regras:</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Chegue o mais perto de 21 sem passar</li>
          <li>• Cartas (J, Q, K) = 10 pontos</li>
          <li>• Ás = 1 ou 11 (quem for melhor)</li>
          <li>• 21 = 100 pontos, Abaixo de 21 = (total/21) × 100</li>
          <li>• Passou de 21 = Estourou = 0 pontos</li>
        </ul>
      </div>

      {/* Debug Info (remove in production) */}
      {gameState && process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-black rounded text-xs">
          <strong>Debug:</strong> Round {gameState.roundId} | State:{" "}
          {gameState.state}
        </div>
      )}
    </div>
  );
}
