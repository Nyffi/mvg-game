// components/BlackjackGame.tsx
"use client";

import { useState } from "react";
import type { Card, GameData, GameState } from "@/models";

interface BlackjackGameProps {
  initialData?: GameData;
}

export default function BlackjackGame({ initialData }: BlackjackGameProps) {
  const [gameData, setGameData] = useState<GameData | null>(
    initialData || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const callAPI = async (endpoint: string, data: any = {}) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/game/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Request failed");
      }

      setGameData(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      console.error(`API Error (${endpoint}):`, err);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    callAPI("start", { initialCard: true });
  };

  const hit = () => {
    if (gameData?.roundId) {
      callAPI("hit", { roundId: gameData.roundId });
    }
  };

  const stand = () => {
    if (gameData?.roundId) {
      callAPI("stand", { roundId: gameData.roundId });
    }
  };

  const getCardDisplay = (card: Card): string => {
    const suitSymbols = {
      "♥": "♥️",
      "♦": "♦️",
      "♣": "♣️",
      "♠": "♠️",
    };
    return `${card.value}${suitSymbols[card.suit]}`;
  };

  const getStateMessage = (state: GameState): string => {
    switch (state) {
      case "idle":
        return "Ready to play";
      case "playing":
        return "Your turn";
      case "bust":
        return "Bust! Over 21";
      case "finished":
        return "Round finished";
      default:
        return "";
    }
  };

  const getStateColor = (state: GameState): string => {
    switch (state) {
      case "playing":
        return "text-blue-600";
      case "bust":
        return "text-red-600";
      case "finished":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const canHit = gameData?.state === "playing" && !loading;
  const canStand = gameData?.state === "playing" && !loading;
  const canStart =
    (!gameData || gameData.state === "bust" || gameData.state === "finished") &&
    !loading;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Blackjack 21</h1>
        <p className="text-gray-600">
          Get as close to 21 as possible without going over!
        </p>
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {gameData?.totalScore || 0}
          </div>
          <div className="text-sm text-gray-600">Total Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {gameData?.pointsLastRound || 0}
          </div>
          <div className="text-sm text-gray-600">Last Round</div>
        </div>
      </div>

      {/* Game State */}
      {gameData && (
        <div className="mb-6">
          <div className="text-center mb-4">
            <div
              className={`text-lg font-semibold ${getStateColor(
                gameData.state
              )}`}
            >
              {getStateMessage(gameData.state)}
            </div>
            <div className="text-3xl font-bold text-gray-800 mt-2">
              Total: {gameData.total}
            </div>
          </div>

          {/* Cards Display */}
          {gameData.hand.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
                Your Cards
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {gameData.hand.map((card, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-center shadow-md min-w-[60px]"
                  >
                    <div className="text-lg font-bold">
                      {getCardDisplay(card)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Action Buttons */}
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
          {loading && !gameData ? "Starting..." : "Start Game"}
        </button>

        <button
          type="button"
          onClick={startGame}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-semibold transition-colors bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? "Starting..." : "New Game"}
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
          {loading && gameData?.state === "playing" ? "Drawing..." : "Hit"}
        </button>

        <button
          type="button"
          onClick={stand}
          disabled={!canStand}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            canStand
              ? "bg-orange-600 hover:bg-orange-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading && gameData?.state === "playing" ? "Finishing..." : "Stand"}
        </button>
      </div>

      {/* Rules */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Rules:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Get as close to 21 as possible without going over</li>
          <li>• Face cards (J, Q, K) = 10 points</li>
          <li>• Aces = 1 or 11 (whichever is better)</li>
          <li>• 21 = 100 points, Under 21 = (total/21) × 100</li>
          <li>• Over 21 = Bust = 0 points</li>
        </ul>
      </div>

      {/* Debug Info (remove in production) */}
      {gameData && process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>Debug:</strong> Round {gameData.roundId} | State:{" "}
          {gameData.state}
        </div>
      )}
    </div>
  );
}
