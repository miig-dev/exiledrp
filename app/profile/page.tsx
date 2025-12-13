"use client";

import { Window } from "@/components/ios/Window";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { User } from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <Window title="Mon Profil" icon={User}>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <p className="text-gray-400">Chargement du profil...</p>
        </div>
      </Window>
    );
  }

  if (!session?.user) {
    return (
      <Window title="Mon Profil" icon={User}>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <p className="text-gray-400">Connecte-toi pour voir ton profil.</p>
        </div>
      </Window>
    );
  }

  const user = session.user;
  const roles = (user as { roles?: string[] }).roles || [];

  return (
    <Window title="Mon Profil" icon={User}>
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-white/5 rounded-lg p-6 w-full max-w-2xl space-y-6 border border-white/10">
        {/* En-tête avec avatar */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          {user.image ? (
            <NextImage
              src={user.image}
              alt={user.name || "Avatar"}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-2 border-blue-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-blue-500 bg-blue-600/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-400">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-gray-400">{user.email || "Email non fourni"}</p>
          </div>
        </div>

        {/* Rôles Discord */}
        {roles.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Rôles Discord
            </h3>
            <div className="flex flex-wrap gap-2">
              {roles.map((role: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-600/20 text-blue-400 border-blue-600/50 px-3 py-1"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Rôles Discord
            </h3>
            <p className="text-sm text-gray-500">Aucun rôle Discord assigné</p>
          </div>
        )}

        {/* Informations détaillées */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Informations
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">ID Utilisateur:</span>
              <span className="text-white font-mono text-xs">
                {user.id || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{user.email || "Non fourni"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nombre de rôles:</span>
              <span className="text-white">{roles.length}</span>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}
