"use client";

import { signIn } from "@/lib/auth-client";
import Link from "next/link";

export default function SignInPage() {
  const handleDiscordSignIn = async () => {
    try {
      await signIn.social({
        provider: "discord",
        callbackURL: "/auth/callback?callbackURL=/ios",
      });
    } catch (error) {
      console.error("Erreur lors de la connexion Discord:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] text-white p-4">
      <div className="max-w-md w-full bg-[#23272A] rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Connexion Discord
        </h1>
        <button
          onClick={handleDiscordSignIn}
          className="w-full bg-[#5865F2] text-white font-bold py-3 px-6 rounded hover:bg-[#4752C4] transition"
        >
          Se connecter avec Discord
        </button>
        <Link
          href="/"
          className="block mt-4 text-center text-sm text-gray-400 hover:text-white transition"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
