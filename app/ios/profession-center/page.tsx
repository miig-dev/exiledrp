"use client";

import { Window } from "@/components/ios/Window";
import { trpc } from "@/lib/trpcClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, CheckCircle, Clock, FileText, Shield, XCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProfessionCenter() {
  // 1. Récupérer les métiers du joueur
  const { data: myJobs, isLoading } = trpc.job.getMyJobs.useQuery();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Sélectionner le premier job par défaut
  if (myJobs && myJobs.length > 0 && !selectedJobId) {
    setSelectedJobId(myJobs[0].jobId);
  }

  const selectedJob = myJobs?.find((j) => j.jobId === selectedJobId);

  return (
    <Window title="Profession Center" icon={Briefcase} className="h-full">
      <div className="flex h-full gap-6">
        {/* Sidebar : Liste des métiers */}
        <aside className="w-64 bg-white/5 rounded-lg p-4 flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            Mes Postes
          </h2>
          {isLoading && <p className="text-sm text-gray-500">Chargement...</p>}
          {myJobs?.map((membership) => (
            <button
              key={membership.id}
              onClick={() => setSelectedJobId(membership.jobId)}
              className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${
                selectedJobId === membership.jobId
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-white/10 text-gray-300"
              }`}
            >
              <div className="p-2 bg-white/10 rounded-full">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-sm">{membership.job.label}</div>
                <div className="text-xs opacity-80">{membership.grade.name}</div>
              </div>
            </button>
          ))}
          {myJobs?.length === 0 && (
            <p className="text-sm text-gray-500 italic">Aucun métier assigné.</p>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
          {selectedJob ? (
            <JobDashboard jobMember={selectedJob} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Sélectionnez un métier pour accéder au dashboard.
            </div>
          )}
        </main>
      </div>
    </Window>
  );
}

// --- Sous-composant Dashboard Métier ---

function JobDashboard({ jobMember }: { jobMember: any }) {
  const utils = trpc.useContext();
  const { data: reports } = trpc.job.getReports.useQuery(
    { jobId: jobMember.jobId },
    { enabled: !!jobMember.jobId }
  );

  const serviceMutation = trpc.job.setServiceStatus.useMutation({
    onSuccess: () => {
      utils.job.getMyJobs.invalidate();
    },
  });

  const handleServiceChange = (status: "OFF_DUTY" | "AVAILABLE" | "BUSY") => {
    serviceMutation.mutate({ jobId: jobMember.jobId, status });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* En-tête avec statut de service */}
      <Card className="bg-white/5 border-white/10 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {jobMember.job.label}
            <Badge variant="outline" className="text-blue-400 border-blue-400/30">
              {jobMember.grade.name}
            </Badge>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Matricule: {jobMember.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Statut Actuel</div>
            <div
              className={`font-bold ${
                jobMember.isAvailable ? "text-green-400" : "text-red-400"
              }`}
            >
              {jobMember.isAvailable ? "EN SERVICE" : "HORS SERVICE"}
            </div>
          </div>
          {jobMember.isAvailable ? (
            <Button
              variant="destructive"
              onClick={() => handleServiceChange("OFF_DUTY")}
              disabled={serviceMutation.isLoading}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Fin de service
            </Button>
          ) : (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={() => handleServiceChange("AVAILABLE")}
              disabled={serviceMutation.isLoading}
            >
              <CheckCircle className="w-4 h-4" />
              Prise de service
            </Button>
          )}
        </div>
      </Card>

      {/* Statistiques Rapides */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label="Heures Service"
          value={`${Math.floor(jobMember.totalServiceTime / 60)}h ${
            jobMember.totalServiceTime % 60
          }m`}
        />
        <StatCard
          icon={FileText}
          label="Rapports émis"
          value={reports?.length || 0}
        />
        <StatCard icon={Shield} label="Niveau Grade" value={jobMember.grade.level} />
      </div>

      {/* Liste des Rapports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Derniers Rapports</h3>
          <Button variant="secondary" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Nouveau Rapport
          </Button>
        </div>

        <div className="space-y-2">
          {reports?.map((report: any) => (
            <div
              key={report.id}
              className="bg-white/5 border border-white/5 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div>
                <div className="font-medium text-white">{report.title}</div>
                <div className="text-xs text-gray-400">
                  Par {report.author.username} •{" "}
                  {format(new Date(report.createdAt), "dd MMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </div>
              </div>
              <Badge
                variant={report.status === "OPEN" ? "default" : "secondary"}
                className={
                  report.status === "OPEN" ? "bg-blue-500/20 text-blue-400" : ""
                }
              >
                {report.status}
              </Badge>
            </div>
          ))}
          {reports?.length === 0 && (
            <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-lg">
              Aucun rapport d'intervention.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex items-center gap-4">
      <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}
