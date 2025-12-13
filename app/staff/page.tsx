"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function StaffPage() {
  const { data: session, status } = useSession();

  type DiscordUser = {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
    // autres champs Discord si besoin
  };

  type CustomUser = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    discord?: DiscordUser;
  };

  return (
    <main className="px-0 pb-6 sm:px-0 sm:pb-10 w-full max-w-4xl mx-auto">
      <div className="w-full mb-6">
        <Image
          src="/staff.png"
          alt="Bannière Staff ExiledRP"
          className="w-full h-auto rounded-lg object-cover"
          width={1200}
          height={400}
          priority
        />
      </div>
      <div className="px-4 sm:px-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#19BFFF] mb-4 text-center sm:text-left">
          Staff public
        </h1>
        {/* Affichage infos Discord */}
        {status === "loading" ? (
          <p className="text-gray-400">Chargement...</p>
        ) : session?.user && (session.user as CustomUser).discord ? (
          <div className="bg-[#23272A] rounded p-4 mb-4">
            <h2 className="text-lg font-bold mb-2">Infos Discord</h2>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify((session.user as CustomUser).discord, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-gray-400">
            Connecte-toi avec Discord pour voir tes infos staff.
          </p>
        )}
        {/* Liste du staff, rôles, fiches, etc. */}
      </div>
    </main>
  );
}
