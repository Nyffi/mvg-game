"use client";

import { getUser } from "@/actions/user-session";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUserAuth() {
      const user = await getUser();
      if (user) {
        setLoggedIn(true);
      }
    }

    checkUserAuth();
  }, []);

  useEffect(() => {
    if (token) {
      fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setLoggedIn(true);
        });
    }
  }, [token]);

  return (
    <div className="flex gap-4 items-center flex-col sm:flex-row">
      <button
        type="button"
        className="rounded-full cursor-pointer border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
        onClick={() => {
          loggedIn
            ? router.push("/blackjack")
            : router.push("http://localhost:5000/auth/google");
        }}
      >
        {loggedIn ? "Jogar" : "Entrar"}
      </button>
      <button
        type="button"
        className="rounded-full cursor-pointer border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
        onClick={() => router.push("http://localhost:4000")}
      >
        Ir pra Loja
      </button>
    </div>
  );
}
