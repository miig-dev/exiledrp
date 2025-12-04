"use client";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] text-white">
      <h1 className="text-3xl font-bold text-[#19BFFF] mb-4">Mon Profil</h1>
      {status === "loading" ? (
        <p className="text-gray-400">Chargement...</p>
      ) : session?.user ? (
        <div className="bg-[#23272A] rounded p-4 mb-4 w-full max-w-md">
          <h2 className="text-lg font-bold mb-2">Infos utilisateur</h2>
          <pre className="text-xs text-gray-300 overflow-x-auto">
            {JSON.stringify(session.user, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-gray-400">Connecte-toi pour voir ton profil.</p>
      )}
      {/* Ajoute ici l’édition du profil, avatar, etc. */}
    </main>
  );
}
