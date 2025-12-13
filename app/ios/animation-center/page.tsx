"use client";

import { Window } from "@/components/ios/Window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpcClient";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, PlusCircle, UserCheck, Users } from "lucide-react";

export default function AnimationCenter() {
  const { data: animations, refetch } = trpc.animation.getAll.useQuery();

  const joinMutation = trpc.animation.join.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <Window title="Animation Center" icon={Calendar} className="h-full">
      <div className="flex flex-col h-full gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Événements à venir
            </h1>
            <p className="text-gray-400">
              Découvrez les animations de Los Santos
            </p>
          </div>
          <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
            <PlusCircle className="w-4 h-4" /> Proposer un event
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-6">
          {animations?.map((event) => (
            <Card
              key={event.id}
              className="bg-white/5 border-white/10 overflow-hidden flex flex-col hover:bg-white/10 transition-all group"
            >
              {/* Image Header (Placeholder) */}
              <div className="h-32 bg-gradient-to-br from-purple-900 to-indigo-900 relative">
                <div className="absolute top-3 right-3">
                  <Badge
                    className={
                      event.status === "PLANNING"
                        ? "bg-blue-500"
                        : event.status === "ONGOING"
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-500"
                    }
                  >
                    {event.status === "ONGOING" ? "EN COURS" : event.status}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 text-white font-bold drop-shadow-md flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(event.date), "dd MMMM à HH:mm", {
                    locale: fr,
                  })}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {event.name}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-3 flex-1">
                  {event.description || "Aucune description disponible."}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  {event.location || "Lieu secret"}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  Organisé par {event.organizer?.username || "Staff"}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Users className="w-4 h-4" />
                    <span className="font-bold text-white">
                      {event._count.participants}
                    </span>{" "}
                    participants
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="secondary"
                      onClick={() =>
                        joinMutation.mutate({ animationId: event.id })
                      }
                    >
                      S&apos;inscrire
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Window>
  );
}
