"use client";

import { Window } from "@/components/ios/Window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RouterOutputs, trpc } from "@/lib/trpcClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  Download,
  Eye,
  FileText,
  Logs,
  Plus,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ExportDataCard } from "./ExportDataCard";

export default function DirectionPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "logs" | "maintenance" | "forms"
  >("overview");

  const { data: animationStats } = trpc.animation.getCounters.useQuery();
  const { data: animationAdvanced } =
    trpc.animation.getAdvancedStats.useQuery();
  const { data: staffStats } = trpc.staff.getGlobalStats.useQuery();
  const { data: logs } = trpc.log.getAll.useQuery(undefined, {
    enabled: activeTab === "logs",
  });
  const { data: activeCalls } = trpc.emergency.getActiveCalls.useQuery({});

  return (
    <Window title="Pôle Direction" icon={Shield} className="h-full">
      <div className="flex h-full flex-col">
        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          <TabButton
            icon={BarChart3}
            label="Vue d'ensemble"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            icon={Logs}
            label="Logs globaux"
            active={activeTab === "logs"}
            onClick={() => setActiveTab("logs")}
          />
          <TabButton
            icon={Settings}
            label="Maintenance"
            active={activeTab === "maintenance"}
            onClick={() => setActiveTab("maintenance")}
          />
          <TabButton
            icon={FileText}
            label="Formulaires"
            active={activeTab === "forms"}
            onClick={() => setActiveTab("forms")}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "overview" && (
            <OverviewTab
              animationStats={animationStats}
              animationAdvanced={animationAdvanced}
              staffStats={staffStats}
              activeCalls={activeCalls}
            />
          )}
          {activeTab === "logs" && <LogsTab logs={logs} />}
          {activeTab === "maintenance" && <MaintenanceTab />}
          {activeTab === "forms" && <FormsEditorTab />}
        </div>
      </div>
    </Window>
  );
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white/5 text-gray-400 hover:bg-white/10"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

type AnimationStats = RouterOutputs["animation"]["getCounters"];
type AnimationAdvanced = RouterOutputs["animation"]["getAdvancedStats"];
type StaffStats = RouterOutputs["staff"]["getGlobalStats"];
type ActiveCalls = RouterOutputs["emergency"]["getActiveCalls"];

function OverviewTab({
  animationStats,
  animationAdvanced,
  staffStats,
  activeCalls,
}: {
  animationStats: AnimationStats | undefined;
  animationAdvanced: AnimationAdvanced | undefined;
  staffStats: StaffStats | undefined;
  activeCalls: ActiveCalls | undefined;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Vue d&apos;ensemble</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Animations totales"
          value={animationStats?.total || 0}
          subValue={`${animationStats?.ongoing || 0} en cours`}
        />
        <StatCard
          icon={Users}
          label="Staff total"
          value={staffStats?.totalStaff || 0}
          subValue={`${staffStats?.totalSanctions || 0} sanctions`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Appels actifs"
          value={activeCalls?.length || 0}
          subValue="Urgences"
        />
        <StatCard
          icon={TrendingUp}
          label="Animations/semaine"
          value={animationAdvanced?.animationsLastWeek || 0}
          subValue="Dernière semaine"
        />
      </div>

      {/* Détails Animations */}
      {animationAdvanced && (
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-4">
            Statistiques Animations
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Animation la plus active</p>
              <p className="text-white font-medium">
                {animationAdvanced.mostActiveAnimation?.name || "Aucune"}
              </p>
              {animationAdvanced.mostActiveAnimation && (
                <p className="text-xs text-gray-500">
                  {animationAdvanced.mostActiveAnimation.participantsCount}{" "}
                  participants
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400">Staff le plus impliqué</p>
              <p className="text-white font-medium">
                {animationAdvanced.mostInvolvedStaff?.username || "Aucun"}
              </p>
              {animationAdvanced.mostInvolvedStaff && (
                <p className="text-xs text-gray-500">
                  {animationAdvanced.mostInvolvedStaff.animationsCount}{" "}
                  animations créées
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400">Durée moyenne</p>
              <p className="text-white font-medium">
                {animationAdvanced.averageDurationMinutes || 0} minutes
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Moyenne par semaine</p>
              <p className="text-white font-medium">
                {animationAdvanced.averagePerWeek?.toFixed(1) || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Répartition Staff */}
      {staffStats?.staffByRole && (
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-4">
            Répartition par rôle
          </h3>
          <div className="space-y-2">
            {staffStats.staffByRole.map((role) => (
              <div
                key={role.roleName}
                className="flex items-center justify-between p-2 bg-white/5 rounded"
              >
                <span className="text-white">{role.roleName}</span>
                <Badge variant="secondary">{role.count}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sanctions récentes */}
      {staffStats?.recentSanctions && staffStats.recentSanctions.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-4">
            Sanctions récentes
          </h3>
          <div className="space-y-2">
            {staffStats.recentSanctions.slice(0, 5).map((sanction) => (
              <div
                key={sanction.id}
                className="flex items-center justify-between p-2 bg-white/5 rounded"
              >
                <div>
                  <p className="text-white text-sm">{sanction.staffUsername}</p>
                  <p className="text-gray-400 text-xs">{sanction.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      sanction.type === "BAN"
                        ? "destructive"
                        : sanction.type === "KICK"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {sanction.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(sanction.createdAt), "dd/MM", {
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Log = RouterOutputs["log"]["getAll"][number];

function LogsTab({ logs }: { logs: Log[] | undefined }) {
  const exportLogs = () => {
    if (!logs) return;
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Logs système</h2>
        <Button size="sm" variant="outline" onClick={exportLogs}>
          <Download className="w-4 h-4 mr-2" /> Exporter
        </Button>
      </div>

      <div className="bg-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: fr,
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {log.userId || "Système"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.details || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!logs || logs.length === 0) && (
          <div className="p-8 text-center text-gray-400">
            <Logs className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Aucun log disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MaintenanceTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Outils de maintenance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MaintenanceCard
          icon={Database}
          title="Base de données"
          description="Vérifier l'état de la base de données"
          action="Vérifier"
          onClick={() => alert("Vérification DB en cours de développement")}
        />
        <MaintenanceCard
          icon={Zap}
          title="Cache"
          description="Vider le cache système"
          action="Vider"
          onClick={() => alert("Vidage cache en cours de développement")}
        />
        <MaintenanceCard
          icon={Eye}
          title="Logs Discord"
          description="Tester la connexion Discord Webhook"
          action="Tester"
          onClick={() => alert("Test Discord en cours de développement")}
        />
        <ExportDataCard />
      </div>

      <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-bold text-yellow-400 mb-1">
              Zone de maintenance
            </h3>
            <p className="text-sm text-yellow-200">
              Ces outils sont réservés aux administrateurs système. Utilisez-les
              avec précaution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  subValue?: string;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-blue-400" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );
}

function MaintenanceCard({
  icon: Icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        <Button size="sm" variant="outline" onClick={onClick}>
          {action}
        </Button>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function FormsEditorTab() {
  const [forms] = useState<
    Array<{ id: string; name: string; fields: unknown[] }>
  >([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Éditeur de formulaires
        </h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nouveau formulaire
        </Button>
      </div>

      <div className="bg-white/5 rounded-lg p-6">
        <p className="text-gray-400 mb-4">
          Créez et gérez des formulaires internes personnalisés pour votre
          organisation.
        </p>
        {forms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Aucun formulaire créé</p>
            <p className="text-sm mt-2">
              Cliquez sur &quot;Nouveau formulaire&quot; pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-white">{form.name}</h3>
                  <p className="text-sm text-gray-400">
                    {form.fields.length} champs
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" /> Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-400 mb-1">
              Éditeur de formulaires
            </h3>
            <p className="text-sm text-blue-200">
              Cette fonctionnalité permet de créer des formulaires personnalisés
              pour collecter des informations spécifiques. L&apos;éditeur visuel
              sera disponible dans une prochaine mise à jour.
      </p>
          </div>
        </div>
      </div>
    </div>
  );
}
