import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

type EmergencyCall = {
  id: string;
  type: string;
  status: "pending" | "assigned" | "closed";
  requester: string;
  time: string;
};

const emergencyCalls: EmergencyCall[] = [
  {
    id: "1",
    type: "Accident de la route",
    status: "pending",
    requester: "John Doe",
    time: "12:34",
  },
  {
    id: "2",
    type: "Incendie",
    status: "assigned",
    requester: "Jane Smith",
    time: "13:10",
  },
  {
    id: "3",
    type: "Agression",
    status: "closed",
    requester: "Alex Dupont",
    time: "14:02",
  },
];

export default function EmergencyLive() {
  return (
    <main className="px-4 py-6 sm:px-8 sm:py-10 w-full max-w-2xl mx-auto flex flex-col items-center">
      <Image
        src="/assets/img/logo-exiledrp.png"
        alt="Logo ExiledRP"
        width={80}
        height={80}
        className="mb-4 w-20 h-20"
        priority
      />
      <h1 className="text-xl sm:text-2xl font-bold text-[#19BFFF] mb-4 text-center sm:text-left">
        UrgenceLive
      </h1>
      <p className="text-gray-300 text-base sm:text-lg text-center sm:text-left mb-6">
        Appels d’urgence, assignation, historique, stats…
      </p>
      <section className="w-full flex flex-col gap-4">
        {emergencyCalls.map((call) => (
          <Card
            key={call.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-2"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-[#19BFFF]">{call.type}</span>
              <span className="text-gray-400 text-sm">
                Demandeur : {call.requester}
              </span>
              <span className="text-gray-400 text-xs">Heure : {call.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  call.status === "pending"
                    ? "destructive"
                    : call.status === "assigned"
                    ? "default"
                    : "secondary"
                }
              >
                {call.status === "pending"
                  ? "En attente"
                  : call.status === "assigned"
                  ? "Assigné"
                  : "Clôturé"}
              </Badge>
              {call.status === "pending" && (
                <Button size="sm" variant="default">
                  Assigner
                </Button>
              )}
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
