"use client";

import { Window } from "@/components/ios/Window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmergencyNotification } from "@/components/ui/emergency-notification";
import { trpc } from "@/lib/trpcClient";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  MapPin,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type EmergencyCall = {
  id: string;
  type: "POLICE" | "EMS" | "MECANO";
  message: string;
  coords?: string | null;
  caller: { username: string };
  createdAt: Date;
  status: string;
  takenBy?: { username: string } | null;
};

export default function EmergencyLive() {
  const [notifications, setNotifications] = useState<EmergencyCall[]>([]);
  const previousCallsRef = useRef<string[]>([]);

  // Récupérer les appels actifs (PENDING ou TAKEN)
  const {
    data: calls,
    isLoading,
    refetch,
  } = trpc.emergency.getActiveCalls.useQuery(
    {},
    { refetchInterval: 5000 } // Auto-refresh toutes les 5s pour le "Live"
  );

  // Détecter les nouveaux appels pour afficher les notifications
  useEffect(() => {
    if (!calls) return;

    const currentCallIds = calls.map((c) => c.id);
    const previousCallIds = previousCallsRef.current;

    // Trouver les nouveaux appels (PENDING uniquement)
    const newCalls = calls.filter(
      (call) =>
        call.status === "PENDING" &&
        !previousCallIds.includes(call.id) &&
        !notifications.some((n) => n.id === call.id)
    );

    if (newCalls.length > 0) {
      setNotifications((prev) => [...prev, ...newCalls]);
    }

    previousCallsRef.current = currentCallIds;
  }, [calls, notifications]);

  const takeCallMutation = trpc.emergency.takeCall.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const closeCallMutation = trpc.emergency.closeCall.useMutation({
    onSuccess: () => refetch(),
  });

  const handleTakeCall = (callId: string) => {
    takeCallMutation.mutate({ callId });
    setNotifications((prev) => prev.filter((n) => n.id !== callId));
  };

  const handleDismissNotification = (callId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== callId));
  };

  return (
    <>
      {/* Notifications popup pour nouveaux appels */}
      {notifications.map((call) => (
        <EmergencyNotification
          key={call.id}
          call={call}
          onTakeCall={handleTakeCall}
          onDismiss={() => handleDismissNotification(call.id)}
        />
      ))}

      <Window
        title="Urgence Live - Central"
        icon={ShieldAlert}
        className="h-full"
      >
        <div className="flex flex-col h-full gap-4">
          {/* Header Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatBox
              label="En attente"
              value={calls?.filter((c) => c.status === "PENDING").length || 0}
              color="text-red-500"
            />
            <StatBox
              label="En cours"
              value={calls?.filter((c) => c.status === "TAKEN").length || 0}
              color="text-orange-500"
            />
            <StatBox label="Unités Dispo" value="-" color="text-green-500" />
            <StatBox
              label="Total Appels"
              value={calls?.length || 0}
              color="text-blue-500"
            />
          </div>

          {/* Liste des appels */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {isLoading && (
              <p className="text-gray-500 text-center py-10">
                Chargement du central...
              </p>
            )}

            {calls?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-white/10 rounded-lg">
                <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
                <p>Aucun appel d&apos;urgence en cours.</p>
                <p className="text-sm">Le calme règne sur Los Santos.</p>
              </div>
            )}

            {calls?.map((call) => (
              <Card
                key={call.id}
                className={`p-4 border-l-4 ${
                  call.status === "PENDING"
                    ? "border-l-red-500 bg-red-500/5"
                    : "border-l-orange-500 bg-orange-500/5"
                } border-white/10`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div
                      className={`p-3 rounded-full h-fit ${
                        call.type === "POLICE"
                          ? "bg-blue-500/20 text-blue-400"
                          : call.type === "EMS"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {call.type === "POLICE" ? (
                        <ShieldAlert className="w-6 h-6" />
                      ) : (
                        <AlertCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-white">
                          {call.type} REQUEST
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(call.createdAt), "HH:mm")}
                        </Badge>
                      </div>
                      <p className="text-gray-300 mt-1 font-medium">
                        {call.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {call.caller.username}
                        </div>
                        {call.coords && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <MapPin className="w-4 h-4" /> {call.coords}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {call.status === "PENDING" ? (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 animate-pulse"
                        onClick={() =>
                          takeCallMutation.mutate({ callId: call.id })
                        }
                      >
                        <Phone className="w-4 h-4 mr-2" /> Prendre l&apos;appel
                      </Button>
                    ) : (
                      <div className="text-right">
                        <div className="text-xs text-orange-400 mb-1">
                          Pris par {call.takenBy?.username}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            closeCallMutation.mutate({ callId: call.id })
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Clôturer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Window>
    </>
  );
}

const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center">
    <span className={`text-2xl font-bold ${color}`}>{value}</span>
    <span className="text-xs text-gray-400 uppercase">{label}</span>
  </div>
);
