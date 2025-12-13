"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Phone, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

type EmergencyCall = {
  id: string;
  type: "POLICE" | "EMS" | "MECANO";
  message: string;
  coords?: string | null;
  caller: { username: string };
  createdAt: Date;
};

type EmergencyNotificationProps = {
  call: EmergencyCall;
  onTakeCall: (callId: string) => void;
  onDismiss: () => void;
};

export const EmergencyNotification = ({
  call,
  onTakeCall,
  onDismiss,
}: EmergencyNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    // Jouer un son d'alerte (optionnel, nécessite un fichier audio)
    if (!soundPlayed) {
      // On pourrait ajouter un son ici si nécessaire
      setSoundPlayed(true);
    }

    // Auto-dismiss après 30 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Attendre l'animation
    }, 30000);

    return () => clearTimeout(timer);
  }, [soundPlayed, onDismiss]);

  if (!isVisible) return null;

  const getTypeColor = () => {
    switch (call.type) {
      case "POLICE":
        return "bg-blue-500/20 border-blue-500 text-blue-400";
      case "EMS":
        return "bg-red-500/20 border-red-500 text-red-400";
      default:
        return "bg-yellow-500/20 border-yellow-500 text-yellow-400";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right duration-300">
      <Card
        className={`p-4 border-l-4 ${getTypeColor()} border-white/20 shadow-2xl min-w-[400px] max-w-[500px]`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1">
            <div className={`p-2 rounded-full ${getTypeColor()}`}>
              {call.type === "POLICE" ? (
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              ) : (
                <AlertCircle className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-white">
                  🚨 {call.type} REQUEST
                </span>
              </div>
              <p className="text-gray-200 text-sm mb-2">{call.message}</p>
              <p className="text-xs text-gray-400">
                Appelant: {call.caller.username}
              </p>
              {call.coords && (
                <p className="text-xs text-blue-400 mt-1">📍 {call.coords}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex-1 animate-pulse"
            onClick={() => onTakeCall(call.id)}
          >
            <Phone className="w-4 h-4 mr-2" /> Prendre l&apos;appel
          </Button>
        </div>
      </Card>
    </div>
  );
};
