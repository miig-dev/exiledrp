import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { gestionProcedure, protectedProcedure, router } from "../trpc";

export const logRouter = router({
  getAll: protectedProcedure.query(async () => {
    // TODO: Ajouter vérification des droits si besoin
    return await prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000, // Limiter pour les performances
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Ajouter vérification des droits si besoin
      return await prisma.log.create({
        data: {
          action: input.action,
          userId: input.userId,
        },
      });
    }),

  /**
   * EXPORT: Exporter toutes les données (Gestion/Direction)
   */
  exportAllData: gestionProcedure.query(async () => {
    const [users, staff, animations, jobs, emergencyCalls, mails, logs] =
      await Promise.all([
        prisma.user.findMany({
          include: { roles: true },
        }),
        prisma.staff.findMany({
          include: {
            user: true,
            role: true,
            notes: true,
            sanctions: true,
            absences: true,
          },
        }),
        prisma.animation.findMany({
          include: {
            organizer: true,
            participants: {
              include: { user: true },
            },
          },
        }),
        prisma.job.findMany({
          include: {
            grades: true,
            members: {
              include: { user: true, grade: true },
            },
            reports: true,
          },
        }),
        prisma.emergencyCall.findMany({
          include: {
            caller: true,
            takenBy: true,
          },
        }),
        prisma.mail.findMany({
          include: {
            sender: true,
            receiver: true,
          },
        }),
        prisma.log.findMany(),
      ]);

    return {
      exportDate: new Date().toISOString(),
      users,
      staff,
      animations,
      jobs,
      emergencyCalls,
      mails,
      logs,
    };
  }),
});
