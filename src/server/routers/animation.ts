import { discordLog } from "@/lib/discord-logger";
import { findUserByIdentifier } from "@/lib/discord-user";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const animationRouter = router({
  /**
   * LIST: Récupérer toutes les animations
   */
  getAll: protectedProcedure.query(async () => {
    return await prisma.animation.findMany({
      orderBy: { date: "asc" },
      include: {
        organizer: {
          select: { username: true },
        },
        _count: {
          select: { participants: true },
        },
      },
    });
  }),

  /**
   * CREATE: Créer une animation (Staff/Animateur)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        date: z.date(), // Date JS
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const animation = await prisma.animation.create({
          data: {
            name: input.name,
            description: input.description,
            date: input.date,
            location: input.location,
            organizerId: ctx.session.user.id,
            status: "PLANNING",
          },
        });

        // Log Discord
        await discordLog("SUCCESS", {
          title: "Nouvelle Animation Créée",
          description: `Une nouvelle animation RP a été créée.`,
          fields: [
            { name: "Nom", value: input.name, inline: true },
            {
              name: "Lieu",
              value: input.location || "Non spécifié",
              inline: true,
            },
            {
              name: "Date",
              value: input.date.toLocaleDateString("fr-FR"),
              inline: true,
            },
            {
              name: "Organisateur",
              value: ctx.session.user.name || "Inconnu",
              inline: true,
            },
            { name: "Statut", value: "PLANNING", inline: true },
          ],
        });

        return { success: true, animation };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la création de l'animation",
        });
      }
    }),

  /**
   * UPDATE: Changer le statut (Organisateur seulement)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PLANNING", "ONGOING", "FINISHED"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const animation = await prisma.animation.findUnique({
        where: { id: input.id },
      });

      if (!animation) throw new TRPCError({ code: "NOT_FOUND" });

      // TODO: Vérifier si admin ou organisateur
      if (animation.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Non autorisé" });
      }

      const updated = await prisma.animation.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      // Log Discord
      await discordLog("INFO", {
        title: "Changement de Statut Animation",
        description: `Le statut de l'animation a été modifié.`,
        fields: [
          { name: "Animation", value: animation.name, inline: true },
          { name: "Ancien statut", value: animation.status, inline: true },
          { name: "Nouveau statut", value: input.status, inline: true },
          {
            name: "Modifié par",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return { success: true, animation: updated };
    }),

  /**
   * USER: Rejoindre une animation avec accréditation optionnelle
   */
  join: protectedProcedure
    .input(
      z.object({
        animationId: z.string(),
        accreditation: z
          .enum(["ORGANIZER", "MODERATOR", "PARTICIPANT", "OBSERVER", "STAFF"])
          .optional()
          .default("PARTICIPANT"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await prisma.animationParticipant.create({
          data: {
            animationId: input.animationId,
            userId: ctx.session.user.id!,
            accreditation: input.accreditation,
          },
        });
        return { success: true };
      } catch {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Déjà inscrit ou erreur",
        });
      }
    }),

  /**
   * USER: Quitter une animation
   */
  leave: protectedProcedure
    .input(z.object({ animationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await prisma.animationParticipant.deleteMany({
        where: {
          animationId: input.animationId,
          userId: ctx.session.user.id,
        },
      });
      return { success: true };
    }),

  /**
   * VIEW: Voir les participants avec leurs accréditations
   */
  getParticipants: protectedProcedure
    .input(z.object({ animationId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.animationParticipant.findMany({
        where: { animationId: input.animationId },
        include: {
          user: {
            select: { username: true, avatar: true },
          },
        },
        orderBy: [
          { accreditation: "asc" }, // Organisateurs en premier
          { joinedAt: "asc" },
        ],
      });
    }),

  /**
   * UPDATE: Mettre à jour l'accréditation d'un participant (Organisateur seulement)
   * Accepte userId (UUID) ou discordId (Discord ID)
   */
  updateParticipantAccreditation: protectedProcedure
    .input(
      z.object({
        animationId: z.string(),
        userId: z.string(), // Peut être UUID ou Discord ID
        accreditation: z.enum([
          "ORGANIZER",
          "MODERATOR",
          "PARTICIPANT",
          "OBSERVER",
          "STAFF",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Vérifier que l'utilisateur est l'organisateur
      const animation = await prisma.animation.findUnique({
        where: { id: input.animationId },
      });

      if (!animation) throw new TRPCError({ code: "NOT_FOUND" });

      if (animation.organizerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seul l'organisateur peut modifier les accréditations",
        });
      }

      // Trouver l'utilisateur par Discord ID ou User ID
      const targetUser = await findUserByIdentifier(input.userId);
      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Utilisateur introuvable (vérifiez le Discord ID ou User ID)",
        });
      }

      await prisma.animationParticipant.updateMany({
        where: {
          animationId: input.animationId,
          userId: targetUser.id,
        },
        data: {
          accreditation: input.accreditation,
        },
      });

      return { success: true };
    }),

  /**
   * UPDATE: Modifier une animation (Organisateur seulement)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        description: z.string().optional(),
        date: z.date().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const animation = await prisma.animation.findUnique({
        where: { id: input.id },
      });

      if (!animation) throw new TRPCError({ code: "NOT_FOUND" });

      if (animation.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Non autorisé" });
      }

      const updated = await prisma.animation.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.date && { date: input.date }),
          ...(input.location !== undefined && { location: input.location }),
        },
      });

      // Log Discord
      await discordLog("INFO", {
        title: "Modification Animation",
        description: `Une animation a été modifiée.`,
        fields: [
          { name: "Animation", value: updated.name, inline: true },
          {
            name: "Modifié par",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return { success: true, animation: updated };
    }),

  /**
   * DELETE: Supprimer une animation (Organisateur seulement)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const animation = await prisma.animation.findUnique({
        where: { id: input.id },
      });

      if (!animation) throw new TRPCError({ code: "NOT_FOUND" });

      if (animation.organizerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Non autorisé" });
      }

      await prisma.animation.delete({
        where: { id: input.id },
      });

      // Log Discord
      await discordLog("WARN", {
        title: "Animation Supprimée",
        description: `Une animation a été supprimée.`,
        fields: [
          { name: "Animation", value: animation.name, inline: true },
          {
            name: "Supprimée par",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return { success: true };
    }),

  /**
   * STATS: Compteurs globaux
   */
  getCounters: protectedProcedure.query(async () => {
    const [total, ongoing, finished] = await Promise.all([
      prisma.animation.count(),
      prisma.animation.count({ where: { status: "ONGOING" } }),
      prisma.animation.count({ where: { status: "FINISHED" } }),
    ]);

    return {
      total,
      ongoing,
      finished,
      planning: total - ongoing - finished,
    };
  }),

  /**
   * STATS: Statistiques avancées
   */
  getAdvancedStats: protectedProcedure.query(async () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Animations de la semaine dernière
    const animationsLastWeek = await prisma.animation.count({
      where: {
        createdAt: { gte: oneWeekAgo },
      },
    });

    // Animation la plus active (avec le plus de participants)
    const mostActiveAnimation = await prisma.animation.findFirst({
      include: {
        _count: {
          select: { participants: true },
        },
        organizer: {
          select: { username: true },
        },
      },
      orderBy: {
        participants: {
          _count: "desc",
        },
      },
    });

    // Staff le plus impliqué (organisateur avec le plus d'animations)
    const mostInvolvedStaff = await prisma.user.findFirst({
      where: {
        animationsCreated: {
          some: {},
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        _count: {
          select: { animationsCreated: true },
        },
      },
      orderBy: {
        animationsCreated: {
          _count: "desc",
        },
      },
    });

    // Temps moyen d'une animation (différence entre date et updatedAt pour les terminées)
    const finishedAnimations = await prisma.animation.findMany({
      where: {
        status: "FINISHED",
        date: { lte: now },
      },
      select: {
        date: true,
        updatedAt: true,
      },
    });

    let averageDuration = 0;
    if (finishedAnimations.length > 0) {
      const durations = finishedAnimations
        .map((anim) => {
          const duration = anim.updatedAt.getTime() - anim.date.getTime();
          return duration / (1000 * 60); // Convertir en minutes
        })
        .filter((d) => d > 0); // Filtrer les durées négatives ou nulles
      if (durations.length > 0) {
        averageDuration =
          durations.reduce((sum, d) => sum + d, 0) / durations.length;
      }
    }

    // Animations par mois (derniers 3 mois)
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const animationsByMonth = await prisma.animation.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: threeMonthsAgo },
      },
      _count: true,
    });

    // Grouper par mois
    const monthlyCounts: Record<string, number> = {};
    animationsByMonth.forEach((anim) => {
      const monthKey = `${anim.createdAt.getFullYear()}-${String(
        anim.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + anim._count;
    });

    return {
      animationsLastWeek,
      averagePerWeek: animationsLastWeek / 1, // Moyenne sur 1 semaine
      mostActiveAnimation: mostActiveAnimation
        ? {
            id: mostActiveAnimation.id,
            name: mostActiveAnimation.name,
            participantsCount: mostActiveAnimation._count.participants,
            organizer: mostActiveAnimation.organizer?.username || "Inconnu",
          }
        : null,
      mostInvolvedStaff: mostInvolvedStaff
        ? {
            id: mostInvolvedStaff.id,
            username: mostInvolvedStaff.username,
            avatar: mostInvolvedStaff.avatar,
            animationsCount: mostInvolvedStaff._count.animationsCreated,
          }
        : null,
      averageDurationMinutes: Math.round(averageDuration),
      monthlyCounts,
    };
  }),
});
