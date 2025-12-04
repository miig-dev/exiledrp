"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] text-white">
      <h1 className="text-2xl font-bold mb-4">Connexion Discord</h1>
      <button
        onClick={() => signIn("discord")}
        className="bg-[#5865F2] text-white font-bold py-2 px-6 rounded hover:bg-[#4752C4] transition"
      >
        Se connecter avec Discord
      </button>
    </div>
  );
}
