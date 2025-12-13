"use client";

import { Window } from "@/components/ios/Window";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RouterOutputs } from "@/lib/trpcClient";
import { trpc } from "@/lib/trpcClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle,
  FileText,
  Gavel,
  Search,
  Shield,
  User,
  UserX,
} from "lucide-react";
import { useState } from "react";

type StaffDetails = RouterOutputs["staff"]["getDetails"];
type StaffNote = StaffDetails["notes"][number];
type StaffSanction = StaffDetails["sanctions"][number];

export default function StaffCenter() {
  const { data: staffList, isLoading } = trpc.staff.getAll.useQuery();
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredStaff = staffList?.filter((s) =>
    s.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Window
      title="Staff Center - Administration"
      icon={Shield}
      className="h-full"
    >
      <div className="flex h-full gap-6">
        {/* Sidebar Liste */}
        <div className="w-80 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher un membre..."
              className="pl-9 bg-white/5 border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {isLoading && (
              <p className="text-gray-500 text-center">Chargement...</p>
            )}
            {filteredStaff?.map((staff) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaffId(staff.id)}
                className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
                  selectedStaffId === staff.id
                    ? "bg-blue-600 shadow-md transform scale-102"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <Avatar className="h-10 w-10 border border-white/10">
                  <AvatarImage src={staff.user.avatar || ""} />
                  <AvatarFallback>{staff.user.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">
                    {staff.user.username}
                  </div>
                  <div className="text-xs text-gray-300 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {staff.role?.name || "Sans rôle"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails Staff */}
        <div className="flex-1 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          {selectedStaffId ? (
            <StaffDetails staffId={selectedStaffId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <User className="w-16 h-16 opacity-20" />
              <p>Sélectionnez un membre du staff pour voir son dossier.</p>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}

// --- Sous-composant Détails ---

function StaffDetails({ staffId }: { staffId: string }) {
  const utils = trpc.useContext();
  const { data: staff, isLoading } = trpc.staff.getDetails.useQuery({
    staffId,
  });

  const addNoteMutation = trpc.staff.addNote.useMutation({
    onSuccess: () => utils.staff.getDetails.invalidate({ staffId }),
  });

  const addSanctionMutation = trpc.staff.addSanction.useMutation({
    onSuccess: () => utils.staff.getDetails.invalidate({ staffId }),
  });

  // Form states
  const [noteContent, setNoteContent] = useState("");
  const [sanctionReason, setSanctionReason] = useState("");
  const [sanctionType, setSanctionType] = useState<
    "WARN" | "BLAME" | "KICK" | "BAN"
  >("WARN");

  if (isLoading || !staff)
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement du dossier...
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      {/* Header Profil */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-transparent flex items-start justify-between">
        <div className="flex gap-4">
          <Avatar className="h-20 w-20 border-2 border-blue-500">
            <AvatarImage src={staff.user.avatar || ""} />
            <AvatarFallback className="text-2xl">
              {staff.user.username[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {staff.user.username}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-blue-600">{staff.role?.name}</Badge>
              <span className="text-xs text-gray-400">
                ID Discord: {staff.user.discordId || "N/A"}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-2 max-w-lg">
              {staff.fiche?.bio || "Aucune biographie renseignée."}
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>
            Rejoint le{" "}
            {format(new Date(staff.joinedAt), "dd/MM/yyyy", { locale: fr })}
          </div>
          <div>Ancienneté: 2 mois</div> {/* TODO: Calcul réel */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
        {/* Colonne Gauche: Notes & Suivi */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Notes Internes
            </h3>
          </div>

          <Card className="p-4 bg-white/5 border-white/10 space-y-3">
            <Textarea
              placeholder="Ajouter une note de suivi..."
              className="bg-black/20 border-white/10 min-h-[80px]"
              value={noteContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNoteContent(e.target.value)
              }
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  addNoteMutation.mutate({ staffId, content: noteContent });
                  setNoteContent("");
                }}
                disabled={!noteContent}
              >
                Ajouter note
              </Button>
            </div>
          </Card>

          <div className="space-y-2">
            {staff.notes.map((note: StaffNote) => (
              <div
                key={note.id}
                className="bg-white/5 p-3 rounded text-sm border-l-2 border-blue-500"
              >
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Par Admin</span> {/* TODO: Nom auteur */}
                  <span>
                    {format(new Date(note.createdAt), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
                <p className="text-gray-200">{note.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Droite: Sanctions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-red-400" /> Sanctions
            </h3>
          </div>

          <Card className="p-4 bg-red-900/10 border-red-500/20 space-y-3">
            <div className="flex gap-2">
              {(["WARN", "BLAME", "KICK", "BAN"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSanctionType(type)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    sanctionType === type
                      ? "bg-red-600 text-white"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <Input
              placeholder="Raison de la sanction..."
              className="bg-black/20 border-white/10"
              value={sanctionReason}
              onChange={(e) => setSanctionReason(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  addSanctionMutation.mutate({
                    staffId,
                    type: sanctionType,
                    reason: sanctionReason,
                  });
                  setSanctionReason("");
                }}
                disabled={!sanctionReason}
              >
                <AlertTriangle className="w-4 h-4 mr-2" /> Appliquer Sanction
              </Button>
            </div>
          </Card>

          <div className="space-y-2">
            {staff.sanctions.map((sanction: StaffSanction) => (
              <div
                key={sanction.id}
                className="bg-red-500/10 p-3 rounded text-sm border-l-2 border-red-500 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive" className="h-5">
                      {sanction.type}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {format(new Date(sanction.createdAt), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <p className="text-gray-200">{sanction.reason}</p>
                </div>
                <UserX className="w-8 h-8 text-red-500/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
