"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpcClient";
import { Download, FileText } from "lucide-react";

export const ExportDataCard = () => {
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
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">Export complet</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={isLoading}
        >
          <Download className="w-4 h-4 mr-2" />
          {isLoading ? "Export..." : "Exporter"}
        </Button>
      </div>
      <p className="text-sm text-gray-400">
        Exporter toutes les données (utilisateurs, staff, animations, métiers,
        urgences, mails, logs)
      </p>
    </div>
  );
};
