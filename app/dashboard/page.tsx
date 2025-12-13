"use client";

import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const roles = (user as { roles?: string[] })?.roles || [];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#181A1B] text-white p-8">
      <h1 className="text-3xl font-bold text-[#19BFFF] mb-4">Dashboard</h1>
      {isPending ? (
        <p className="text-gray-400">Chargement...</p>
      ) : user ? (
        <div className="bg-[#23272A] rounded-lg p-6 w-full max-w-2xl space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Bienvenue, {user.name}!</h2>
            <p className="text-gray-400">Tableau de bord ExiledRP</p>
          </div>

          {/* Affichage des rôles Discord */}
          {roles.length > 0 ? (
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Vos Rôles Discord
              </h3>
              <div className="flex flex-wrap gap-2">
                {roles.map((role: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-400 border-blue-600/50"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-gray-500">
                Aucun rôle Discord assigné
              </p>
            </div>
          )}

          {/* Informations utilisateur */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Informations
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user.email || "Non fourni"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-white font-mono text-xs">
                  {user.id || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">Connecte-toi pour voir ton profil.</p>
      )}
    </main>
  );
}
