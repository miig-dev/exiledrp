"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpcClient";
import {
  Ambulance,
  ArrowRight,
  Briefcase,
  Calendar,
  Car,
  Loader2,
  Mail,
  Shield,
  ShieldAlert,
  TrendingUp,
  User,
  Users,
  Wrench,
  Building2,
  HardHat,
  Activity,
  AlertCircle,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function IosDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [roles, setRoles] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const rolesSyncedRef = useRef(false);

  // Applications principales
  const mainApps = [
    { label: "Urgences", icon: ShieldAlert, href: "/ios/emergency-live", color: "text-red-400" },
    { label: "Animation", icon: Calendar, href: "/ios/animation-center", color: "text-green-400" },
    { label: "Messagerie", icon: Mail, href: "/ios/mail", color: "text-yellow-400" },
    { label: "Staff", icon: Users, href: "/ios/staff-center", color: "text-purple-400" },
  ];

  // Métiers selon les instructions du client
  const jobs = [
    { label: "Police", icon: Shield, href: "/ios/profession-center?job=police", color: "text-blue-400" },
    { label: "SAMU", icon: Ambulance, href: "/ios/profession-center?job=samu", color: "text-red-400" },
    { label: "Pompiers", icon: ShieldAlert, href: "/ios/profession-center?job=pompiers", color: "text-orange-400" },
    { label: "Mécano", icon: Wrench, href: "/ios/profession-center?job=mecano", color: "text-yellow-400" },
    { label: "Taxi", icon: Car, href: "/ios/profession-center?job=taxi", color: "text-yellow-500" },
    { label: "Gouvernement", icon: Building2, href: "/ios/profession-center?job=gouvernement", color: "text-gray-400" },
    { label: "Services Techniques", icon: HardHat, href: "/ios/profession-center?job=services-techniques", color: "text-gray-300" },
  ];

  // Charger les rôles depuis la session
  useEffect(() => {
    if (user) {
      const userRoles = (user as { roles?: string[] })?.roles || [];
      setRoles(userRoles);
    }
  }, [user]);

  // Synchroniser les rôles Discord après la connexion (une seule fois)
  useEffect(() => {
    if (!user?.id || isSyncing) return;

    const syncKey = `roles_synced_${user.id}`;
    const alreadySynced = sessionStorage.getItem(syncKey);

    // Si déjà synchronisé dans cette session, ne rien faire
    if (alreadySynced) {
      return;
    }

    // Si déjà en cours de synchronisation, ne rien faire
    if (rolesSyncedRef.current) {
      return;
    }

    rolesSyncedRef.current = true;
    setIsSyncing(true);

    fetch("/api/auth/sync-roles", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("✅ Rôles Discord synchronisés:", data.roles);
          sessionStorage.setItem(syncKey, "true");
          // Mettre à jour les rôles directement sans recharger la page
          setRoles(data.roles);
        } else {
          sessionStorage.removeItem(syncKey);
          rolesSyncedRef.current = false;
        }
      })
      .catch((error) => {
        console.error("Erreur synchronisation rôles:", error);
        sessionStorage.removeItem(syncKey);
        rolesSyncedRef.current = false;
      })
      .finally(() => {
        setIsSyncing(false);
      });
  }, [user?.id, isSyncing]);

  // Récupérer les statistiques
  const { data: animationStats } = trpc.animation.getCounters.useQuery();
  const { data: activeCalls } = trpc.emergency.getActiveCalls.useQuery({});
  const { data: myJobs } = trpc.job.getMyJobs.useQuery();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-[#19BFFF] animate-spin" />
        <p className="text-gray-400">Chargement du dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <p className="text-lg font-semibold text-white mb-2">
          Session expirée
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Veuillez vous reconnecter pour accéder au dashboard.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#19BFFF] text-white rounded-lg hover:bg-[#0ea5e9] transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête utilisateur */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            {user.image && (
              <NextImage
                src={user.image}
                alt={user.name || "Avatar"}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-lg"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-gray-400">{user.email}</p>
              {roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {roles.slice(0, 3).map((role: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-600/20 text-blue-400 border-blue-600/50 text-xs"
                    >
                      {role}
                    </Badge>
                  ))}
                  {roles.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="bg-gray-600/20 text-gray-400 border-gray-600/50 text-xs"
                    >
                      +{roles.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          {isSyncing && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600/50 rounded-lg">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-400">Synchronisation...</span>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Activity}
            label="Animations"
            value={animationStats?.total || 0}
            subValue={`${animationStats?.ongoing || 0} en cours`}
            color="text-green-400"
            href="/ios/animation-center"
          />
          <StatCard
            icon={AlertCircle}
            label="Appels actifs"
            value={activeCalls?.length || 0}
            subValue="Urgences"
            color="text-red-400"
            href="/ios/emergency-live"
          />
          <StatCard
            icon={Briefcase}
            label="Mes métiers"
            value={myJobs?.length || 0}
            subValue="Postes"
            color="text-blue-400"
            href="/ios/profession-center"
          />
          <StatCard
            icon={TrendingUp}
            label="Performance"
            value={animationStats?.finished || 0}
            subValue="Terminées"
            color="text-purple-400"
            href="/ios/staff-center"
          />
        </div>

        {/* Applications principales */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>Applications</span>
            <span className="text-sm font-normal text-gray-400">Accès rapide</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainApps.map((app) => {
              const Icon = app.icon;
              return (
                <Card
                  key={app.href}
                  className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
                  onClick={() => router.push(app.href)}
                >
                  <div className="p-6 flex flex-col items-center text-center gap-3">
                    <div className={`p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-500/10 group-hover:from-blue-600/30 group-hover:to-blue-500/20 transition-all`}>
                      <Icon className={`w-8 h-8 ${app.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{app.label}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
                        <span>Accéder</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Métiers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              <span>Métiers</span>
            </h2>
            <Link
              href="/ios/profession-center"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Voir tous <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {jobs.map((job) => {
              const Icon = job.icon;
              return (
                <Card
                  key={job.href}
                  className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
                  onClick={() => router.push(job.href)}
                >
                  <div className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors`}>
                      <Icon className={`w-5 h-5 ${job.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm truncate">{job.label}</h3>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant StatCard
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  subValue?: string;
  color?: string;
  href?: string;
}) {
  const router = useRouter();
  const content = (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-500/10 group-hover:from-blue-600/30 group-hover:to-blue-500/20 transition-all`}>
            <Icon className={`w-6 h-6 ${color || "text-blue-400"} group-hover:scale-110 transition-transform`} />
          </div>
          {href && (
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
          )}
        </div>
        <div>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
          {subValue && (
            <p className="text-xs text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <div onClick={() => router.push(href)}>
        {content}
      </div>
    );
  }

  return content;
}
