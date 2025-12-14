"use client";

import { Window } from "@/components/ios/Window";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouterOutputs, trpc } from "@/lib/trpcClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Download,
  FileText,
  Search,
  Shield,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";

type StaffMember = RouterOutputs["staff"]["getAll"][number];

export default function GestionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: staffList, refetch } = trpc.staff.getAll.useQuery();
  const { data: globalStats } = trpc.staff.getGlobalStats.useQuery();

  const deleteMutation = trpc.staff.deleteStaff.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedStaff(null);
    },
  });

  const filteredStaff = staffList?.filter(
    (staff) =>
      staff.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Window title="Pôle Gestion" icon={Shield} className="h-full">
      <div className="flex h-full gap-4 p-4">
        {/* Sidebar avec stats */}
        <div className="w-80 bg-white/5 rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Statistiques</h2>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowAddForm(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Ajouter Staff
            </Button>
          </div>

          {globalStats && (
            <div className="space-y-3">
              <StatCard
                icon={Users}
                label="Total Staff"
                value={globalStats.totalStaff}
              />
              <StatCard
                icon={FileText}
                label="Notes totales"
                value={globalStats.totalNotes}
              />
              <StatCard
                icon={TrendingUp}
                label="Sanctions"
                value={globalStats.totalSanctions}
              />
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-2">Moyennes</p>
                <p className="text-xs text-gray-500">
                  Notes/staff: {globalStats.averageNotesPerStaff.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">
                  Sanctions/staff:{" "}
                  {globalStats.averageSanctionsPerStaff.toFixed(1)}
                </p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-white/10">
            <ExportDataButton />
          </div>
        </div>

        {/* Liste du staff */}
        <div className="flex-1 bg-white/5 rounded-lg p-4 flex flex-col">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un membre..."
                className="pl-10 bg-white/5 border-white/10 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredStaff?.map((staff) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaff(staff)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedStaff?.id === staff.id
                    ? "bg-blue-600/20 border border-blue-500"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={staff.user.avatar || ""} />
                    <AvatarFallback>
                      {staff.user.username?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {staff.user.username || "Inconnu"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {staff.role && (
                        <Badge variant="secondary" className="text-xs">
                          {staff.role.name}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">
                        {format(new Date(staff.joinedAt), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(`Supprimer ${staff.user.username} du staff ?`)
                      ) {
                        deleteMutation.mutate({ staffId: staff.id });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <UserMinus className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails du staff sélectionné */}
        {selectedStaff && (
          <div className="w-96 bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-4">
              Détails du membre
            </h3>
            <StaffDetails staffId={selectedStaff.id} />
          </div>
        )}

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <AddStaffForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              refetch();
            }}
          />
        )}
      </div>
    </Window>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white/5 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-400">{label}</span>
        </div>
        <span className="text-lg font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

function StaffDetails({ staffId }: { staffId: string }) {
  const { data: details } = trpc.staff.getDetails.useQuery({ staffId });
  const { data: stats } = trpc.staff.getPerformanceStats.useQuery({
    staffId,
  });
  const updateRoleMutation = trpc.staff.updateStaffRole.useMutation({
    onSuccess: () => {
      // Refetch sera géré par le parent
      window.location.reload(); // Simple refresh pour mettre à jour
    },
  });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleId, setNewRoleId] = useState<string>("");

  if (!details) return <p className="text-gray-400">Chargement...</p>;

  type StaffDetailsType = RouterOutputs["staff"]["getDetails"];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-400">Rôle</p>
        <p className="text-white font-medium">
          {(details as StaffDetailsType).role?.name || "Aucun rôle"}
        </p>
      </div>
      {stats && (
        <div className="space-y-2 pt-4 border-t border-white/10">
          <p className="text-sm font-semibold text-white">Performance</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-400">Notes</p>
              <p className="text-white">{stats.totalNotes}</p>
            </div>
            <div>
              <p className="text-gray-400">Sanctions</p>
              <p className="text-white">{stats.totalSanctions}</p>
            </div>
            <div>
              <p className="text-gray-400">Animations</p>
              <p className="text-white">{stats.totalAnimationsCreated}</p>
            </div>
            <div>
              <p className="text-gray-400">Score</p>
              <p className="text-white">{stats.performanceScore}/100</p>
            </div>
          </div>
        </div>
      )}
      <div className="pt-4 border-t border-white/10">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => setShowRoleModal(true)}
        >
          <Shield className="w-4 h-4 mr-2" /> Changer le rôle
        </Button>
      </div>
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1c] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">
              Changer le rôle
            </h3>
            <div className="space-y-4">
              <Input
                placeholder="ID du nouveau rôle (laisser vide pour aucun)"
                className="bg-white/5 border-white/10 text-white"
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowRoleModal(false);
                    setNewRoleId("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    updateRoleMutation.mutate({
                      staffId,
                      roleId: newRoleId || null,
                    });
                    setShowRoleModal(false);
                  }}
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending
                    ? "Modification..."
                    : "Modifier"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddStaffForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.staff.createStaffByUsername.useMutation({
    onSuccess: () => {
      onSuccess();
      setUsername("");
      setRoleId("");
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Erreur lors de l'ajout");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError("Le nom d'utilisateur est requis");
      return;
    }
    createMutation.mutate({
      username: username.trim(),
      roleId: roleId.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1c1c1c] rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-white mb-4">Ajouter un membre</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nom d'utilisateur Discord"
            className="bg-white/5 border-white/10 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="ID du rôle (optionnel)"
            className="bg-white/5 border-white/10 text-white"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExportDataButton() {
  const { isLoading, refetch } = trpc.log.exportAllData.useQuery(
    undefined,
    { enabled: false } // Ne pas charger automatiquement
  );

  const handleExport = async () => {
    try {
      const result = await refetch();
      if (result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `exiledrp-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erreur export:", error);
      alert("Erreur lors de l'export des données");
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleExport}
      disabled={isLoading}
    >
      <Download className="w-4 h-4 mr-2" />
      {isLoading ? "Export..." : "Exporter données"}
    </Button>
  );
}
