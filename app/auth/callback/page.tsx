"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const callbackURL = searchParams.get("callbackURL") || "/ios";

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        // Utilisateur connecté, rediriger vers la page demandée ou /ios par défaut
        router.push(callbackURL);
      } else {
        // Pas de session, rediriger vers la page de connexion
        router.push("/auth/signin");
      }
    }
  }, [session, isPending, router, callbackURL]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#19BFFF]">
          Connexion en cours...
        </h1>
        <p className="text-gray-400">Redirection en cours...</p>
      </div>
    </div>
  );
}
