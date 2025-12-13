import { discordLog } from "@/lib/discord-logger";
import { findUserByIdentifier } from "@/lib/discord-user";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const jobRouter = router({
  /**
   * ADMIN: Créer un nouveau métier
   */
  createJob: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        label: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const job = await prisma.job.create({
          data: {
            name: input.name,
            label: input.label,
          },
        });
        return { success: true, job };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible de créer le métier",
        });
      }
    }),

  /**
   * ADMIN: Ajouter un grade à un métier
   */
  addGrade: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        name: z.string(),
        level: z.number().min(0),
        salary: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const grade = await prisma.jobGrade.create({
          data: {
            jobId: input.jobId,
            name: input.name,
            level: input.level,
            salary: input.salary,
          },
        });
        return { success: true, grade };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible d'ajouter le grade",
        });
      }
    }),

  /**
   * PUBLIC/AUTH: Lister tous les métiers avec leurs grades
   */
  getAllJobs: protectedProcedure.query(async () => {
    return await prisma.job.findMany({
      include: {
        grades: {
          orderBy: { level: "asc" },
        },
      },
      orderBy: { label: "asc" },
    });
  }),

  /**
   * BOSS: Recruter un membre
   * Accepte userId (UUID) ou discordId (Discord ID)
   */
  addMember: protectedProcedure
    .input(
      z.object({
        userId: z.string(), // Peut être UUID ou Discord ID
        jobId: z.string(),
        gradeId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Trouver l'utilisateur par Discord ID ou User ID
        const targetUser = await findUserByIdentifier(input.userId);
        if (!targetUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Utilisateur introuvable (vérifiez le Discord ID ou User ID)",
          });
        }

        const existingMember = await prisma.jobMember.findUnique({
          where: {
            userId_jobId: {
              userId: targetUser.id,
              jobId: input.jobId,
            },
          },
        });

        if (existingMember) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "L'utilisateur est déjà membre de ce métier",
          });
        }

        const member = await prisma.jobMember.create({
          data: {
            userId: targetUser.id,
            jobId: input.jobId,
            gradeId: input.gradeId,
          },
          include: {
            user: {
              select: { username: true, discordId: true },
            },
            job: {
              select: { label: true },
            },
          },
        });

        // Log Discord
        await discordLog("INFO", {
          title: "Nouveau Membre Recruté",
          description: `Un nouveau membre a été recruté dans un métier.`,
          fields: [
            {
              name: "Utilisateur",
              value: member.user.username || "Inconnu",
              inline: true,
            },
            {
              name: "Discord ID",
              value: member.user.discordId || "Non défini",
              inline: true,
            },
            {
              name: "Métier",
              value: member.job.label,
              inline: true,
            },
          ],
        });

        return { success: true, member };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors du recrutement",
        });
      }
    }),

  /**
   * USER: Récupérer ses propres métiers
   */
  getMyJobs: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await prisma.jobMember.findMany({
      where: { userId },
      include: {
        job: true,
        grade: true,
      },
    });
  }),

  // --- FONCTIONNALITÉS AVANCÉES (Job V2) ---

  /**
   * MEMBER: Créer un rapport d'intervention
   */
  createReport: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        title: z.string().min(3),
        content: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Vérifier si l'utilisateur appartient au job
      const membership = await prisma.jobMember.findUnique({
        where: {
          userId_jobId: {
            userId: ctx.session.user.id!,
            jobId: input.jobId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous ne faites pas partie de ce métier",
        });
      }

      const job = await prisma.job.findUnique({
        where: { id: input.jobId },
        select: { label: true },
      });

      const report = await prisma.jobReport.create({
        data: {
          jobId: input.jobId,
          authorId: ctx.session.user.id!,
          title: input.title,
          content: input.content,
          status: "OPEN",
        },
      });

      // Log Discord
      await discordLog("INFO", {
        title: "Nouveau Rapport d'Intervention",
        description: `Un nouveau rapport d'intervention a été créé.`,
        fields: [
          {
            name: "Métier",
            value: job?.label || input.jobId,
            inline: true,
          },
          {
            name: "Titre",
            value: input.title,
            inline: true,
          },
          {
            name: "Auteur",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return { success: true, report };
    }),

  /**
   * MEMBER: Lister les rapports du métier
   */
  getReports: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input, ctx }) => {
      const membership = await prisma.jobMember.findUnique({
        where: {
          userId_jobId: {
            userId: ctx.session.user.id!,
            jobId: input.jobId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès refusé aux rapports",
        });
      }

      return await prisma.jobReport.findMany({
        where: { jobId: input.jobId },
        include: {
          author: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  /**
   * MEMBER: Prendre ou quitter son service
   */
  setServiceStatus: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        status: z.enum(["OFF_DUTY", "AVAILABLE", "BUSY", "IN_INTERVENTION"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const membership = await prisma.jobMember.findUnique({
        where: {
          userId_jobId: {
            userId: ctx.session.user.id!,
            jobId: input.jobId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Métier introuvable pour cet utilisateur",
        });
      }

      const isAvailable = input.status !== "OFF_DUTY";
      // Calcul du temps de service à ajouter si on quitte le service (simplifié)
      // TODO: Implémenter un vrai calcul basé sur lastServiceStart

      await prisma.jobMember.update({
        where: { id: membership.id },
        data: {
          serviceStatus: input.status,
          isAvailable,
          lastServiceStart: isAvailable ? new Date() : null,
        },
      });

      return { success: true, status: input.status };
    }),

  /**
   * BOSS: Obtenir les statistiques du métier
   */
  getJobStats: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      // TODO: Vérifier rôle Boss/Admin
      const memberCount = await prisma.jobMember.count({
        where: { jobId: input.jobId },
      });

      const onDutyCount = await prisma.jobMember.count({
        where: {
          jobId: input.jobId,
          isAvailable: true,
        },
      });

      const reportCount = await prisma.jobReport.count({
        where: { jobId: input.jobId },
      });

      return {
        memberCount,
        onDutyCount,
        reportCount,
      };
    }),
});
