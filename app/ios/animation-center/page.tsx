import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

type Animation = {
  id: string;
  title: string;
  organizer: string;
  date: string;
  status: "draft" | "active" | "closed";
};

const animations: Animation[] = [
  {
    id: "1",
    title: "Braquage Cyberbank",
    organizer: "Mila Rios",
    date: "2025-12-04",
    status: "active",
  },
  {
    id: "2",
    title: "Course de drones",
    organizer: "Yann Leclerc",
    date: "2025-12-02",
    status: "closed",
  },
  {
    id: "3",
    title: "Marché noir RP",
    organizer: "Staff Event",
    date: "2025-12-10",
    status: "draft",
  },
];

export default function AnimationCenter() {
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
        Animation Center
      </h1>
      <p className="text-gray-300 text-base sm:text-lg text-center sm:text-left mb-6">
        Gestion des animations RP, participants, stats…
      </p>
      <section className="w-full flex flex-col gap-4">
        {animations.map((anim) => (
          <Card
            key={anim.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-2"
          >
            <div className="flex flex-col">
              <span className="font-semibold text-[#19BFFF] text-lg">
                {anim.title}
              </span>
              <span className="text-gray-400 text-sm">
                Organisateur : {anim.organizer}
              </span>
              <span className="text-gray-400 text-xs">Date : {anim.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  anim.status === "active"
                    ? "default"
                    : anim.status === "draft"
                    ? "secondary"
                    : "destructive"
                }
              >
                {anim.status === "active"
                  ? "En cours"
                  : anim.status === "draft"
                  ? "Brouillon"
                  : "Clôturé"}
              </Badge>
              {anim.status === "draft" && (
                <Button size="sm" variant="default">
                  Publier
                </Button>
              )}
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
