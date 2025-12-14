import { discordLog } from "@/lib/discord-logger";
import { findUserByIdentifier } from "@/lib/discord-user";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const staffRouter = router({
  /**
   * LIST: Liste de tout le personnel
   */
  getAll: protectedProcedure.query(async () => {
    return await prisma.staff.findMany({
      include: {
        user: { select: { username: true, avatar: true } },
        role: true,
      },
      orderBy: { role: { name: "asc" } }, // Supposons ordre alphabétique pour l'instant
    });
  }),

  /**
   * DETAILS: Fiche complète (Notes, Sanctions, Bio)
   * Réservé Gestion/Direction
   */
  getDetails: protectedProcedure
    .input(z.object({ staffId: z.string() }))
    .query(async ({ input }) => {
      // TODO: Vérifier permissions (Direction/Gestion)

      const staff = await prisma.staff.findUnique({
        where: { id: input.staffId },
        include: {
          user: { select: { username: true, avatar: true, discordId: true } },
          role: true,
          fiche: true,
          notes: {
            orderBy: { createdAt: "desc" },
            include: {
              author: {
                select: { username: true },
              },
            },
          },
          sanctions: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!staff) throw new TRPCError({ code: "NOT_FOUND" });
      return staff;
    }),

  /**
   * ACTION: Ajouter une note
   */
  addNote: protectedProcedure
    .input(
      z.object({
        staffId: z.string(),
        content: z.string().min(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Check permissions
      const note = await prisma.staffNote.create({
        data: {
          staffId: input.staffId,
          content: input.content,
          authorId: ctx.session.user.id as string,
        },
      });
      await discordLog("INFO", {
        title: "Nouvelle Note Staff",
        description: `Une note a été ajoutée.`,
        fields: [
          { name: "Staff Cible ID", value: input.staffId, inline: true },
          { name: "Contenu", value: input.content, inline: false },
          {
            name: "Auteur",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return note;
    }),

  /**
   * ACTION: Sanctionner
   */
  addSanction: protectedProcedure
    .input(
      z.object({
        staffId: z.string(),
        type: z.enum(["WARN", "BLAME", "KICK", "BAN"]),
        reason: z.string().min(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Check permissions strictes
      const sanction = await prisma.staffSanction.create({
        data: {
          staffId: input.staffId,
          type: input.type,
          reason: input.reason,
          authorId: ctx.session.user.id as string,
        },
      });

      // Log Discord Critique
      await discordLog("WARN", {
        title: `Sanction Staff: ${input.type}`,
        description: `Une sanction a été appliquée.`,
        fields: [
          { name: "Staff Cible ID", value: input.staffId, inline: true },
          { name: "Type", value: input.type, inline: true },
          { name: "Raison", value: input.reason, inline: false },
          {
            name: "Auteur",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return sanction;
    }),

  /**
   * STATS: Statistiques de performance d'un staff
   */
  getPerformanceStats: protectedProcedure
    .input(z.object({ staffId: z.string() }))
    .query(async ({ input }) => {
      const staff = await prisma.staff.findUnique({
        where: { id: input.staffId },
        include: {
          notes: true,
          sanctions: true,
          user: {
            select: {
              username: true,
              animationsCreated: {
                select: { id: true },
              },
              jobMembers: {
                select: {
                  job: {
                    select: { label: true },
                  },
                  totalServiceTime: true,
                },
              },
            },
          },
        },
      });

      if (!staff) throw new TRPCError({ code: "NOT_FOUND" });

      // Compter les sanctions par type
      const sanctionsByType = staff.sanctions.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculer le temps total de service
      const totalServiceTime = staff.user.jobMembers.reduce(
        (sum, member) => sum + member.totalServiceTime,
        0
      );

      // Dernière activité (dernière note ou sanction)
      const lastNote = staff.notes[0];
      const lastSanction = staff.sanctions[0];
      let lastActivity: Date | null = null;
      if (lastNote && lastSanction) {
        lastActivity =
          lastNote.createdAt > lastSanction.createdAt
            ? lastNote.createdAt
            : lastSanction.createdAt;
      } else if (lastNote) {
        lastActivity = lastNote.createdAt;
      } else if (lastSanction) {
        lastActivity = lastSanction.createdAt;
      }

      return {
        staffId: staff.id,
        username: staff.user.username,
        totalNotes: staff.notes.length,
        totalSanctions: staff.sanctions.length,
        sanctionsByType,
        totalAnimationsCreated: staff.user.animationsCreated.length,
        totalServiceTimeMinutes: totalServiceTime,
        totalServiceTimeHours: Math.round((totalServiceTime / 60) * 10) / 10,
        jobsCount: staff.user.jobMembers.length,
        lastActivity,
        // Score de performance (simple calcul)
        performanceScore: Math.max(
          0,
          100 - staff.sanctions.length * 10 - (staff.notes.length > 20 ? 5 : 0)
        ),
      };
    }),

  /**
   * STATS: Statistiques globales du staff
   */
  getGlobalStats: protectedProcedure.query(async () => {
    const [
      totalStaff,
      totalNotes,
      totalSanctions,
      staffByRole,
      recentSanctions,
    ] = await Promise.all([
      prisma.staff.count(),
      prisma.staffNote.count(),
      prisma.staffSanction.count(),
      prisma.staff.groupBy({
        by: ["roleId"],
        _count: true,
      }),
      prisma.staffSanction.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          staff: {
            include: {
              user: {
                select: { username: true },
              },
            },
          },
        },
      }),
    ]);

    // Enrichir staffByRole avec les noms de rôles
    const staffByRoleWithNames = await Promise.all(
      staffByRole.map(async (group) => {
        const role = group.roleId
          ? await prisma.role.findUnique({
              where: { id: group.roleId },
              select: { name: true },
            })
          : null;
        return {
          roleName: role?.name || "Sans rôle",
          count: group._count,
        };
      })
    );

    return {
      totalStaff,
      totalNotes,
      totalSanctions,
      averageNotesPerStaff: totalStaff > 0 ? totalNotes / totalStaff : 0,
      averageSanctionsPerStaff:
        totalStaff > 0 ? totalSanctions / totalStaff : 0,
      staffByRole: staffByRoleWithNames,
      recentSanctions: recentSanctions.map((s) => ({
        id: s.id,
        type: s.type,
        reason: s.reason,
        staffUsername: s.staff.user.username,
        createdAt: s.createdAt,
      })),
    };
  }),

  /**
   * GESTION: Créer un membre staff (par username)
   */
  createStaffByUsername: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        roleId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Trouver l'utilisateur par username
      const user = await prisma.user.findFirst({
        where: { username: input.username },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      // Vérifier qu'il n'est pas déjà staff
      const existingStaff = await prisma.staff.findUnique({
        where: { userId: user.id },
      });

      if (existingStaff) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cet utilisateur est déjà membre du staff",
        });
      }

      const staff = await prisma.staff.create({
        data: {
          userId: user.id,
          roleId: input.roleId || null,
        },
        include: {
          user: { select: { username: true } },
          role: true,
        },
      });

      // Log Discord
      await discordLog("SUCCESS", {
        title: "✅ Nouveau Membre Staff",
        description: `Un nouveau membre a été ajouté au staff.`,
        fields: [
          {
            name: "Utilisateur",
            value: staff.user.username ?? "Inconnu",
            inline: true,
          },
          {
            name: "Rôle",
            value: staff.role?.name || "Aucun",
            inline: true,
          },
          {
            name: "Ajouté par",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return { success: true, staff };
    }),

  /**
   * GESTION: Créer un membre staff
   * Accepte userId (UUID) ou discordId (Discord ID)
   */
  createStaff: protectedProcedure
    .input(
      z.object({
        userId: z.string(), // Peut être UUID ou Discord ID
        roleId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Trouver l'utilisateur par Discord ID ou User ID
      const targetUser = await findUserByIdentifier(input.userId);
      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Utilisateur introuvable (vérifiez le Discord ID ou User ID)",
        });
      }

      // Vérifier qu'il n'est pas déjà staff
      const existingStaff = await prisma.staff.findUnique({
        where: { userId: targetUser.id },
      });

      if (existingStaff) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cet utilisateur est déjà membre du staff",
        });
      }

      const staff = await prisma.staff.create({
        data: {
          userId: targetUser.id,
          roleId: input.roleId || null,
        },
        include: {
          user: { select: { username: true, discordId: true } },
          role: true,
        },
      });

      // Log Discord
      await discordLog("SUCCESS", {
        title: "✅ Nouveau Membre Staff",
        description: `Un nouveau membre a été ajouté au staff.`,
        fields: [
          {
            name: "Utilisateur",
            value: staff.user.username ?? "Inconnu",
            inline: true,
          },
          {
            name: "Discord ID",
            value: staff.user.discordId || "Non défini",
            inline: true,
          },
          {
            name: "Rôle",
            value: staff.role?.name || "Aucun",
            inline: true,
          },
          {
            name: "Ajouté par",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return { success: true, staff };
    }),

  /**
   * GESTION: Supprimer un membre staff
   */
  deleteStaff: protectedProcedure
    .input(z.object({ staffId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const staff = await prisma.staff.findUnique({
        where: { id: input.staffId },
        include: {
          user: { select: { username: true } },
          role: true,
        },
      });

      if (!staff) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await prisma.staff.delete({
        where: { id: input.staffId },
      });

      // Log Discord
      await discordLog("WARN", {
        title: "❌ Membre Staff Supprimé",
        description: `Un membre a été retiré du staff.`,
        fields: [
          {
            name: "Utilisateur",
            value: staff.user.username ?? "Inconnu",
            inline: true,
          },
          {
            name: "Rôle précédent",
            value: staff.role?.name || "Aucun",
            inline: true,
          },
          {
            name: "Supprimé par",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return { success: true };
    }),

  /**
   * GESTION: Changer le rôle d'un staff
   */
  updateStaffRole: protectedProcedure
    .input(
      z.object({
        staffId: z.string(),
        roleId: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const staff = await prisma.staff.findUnique({
        where: { id: input.staffId },
        include: {
          user: { select: { username: true } },
          role: true,
        },
      });

      if (!staff) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const oldRole = staff.role?.name || "Aucun";

      const updated = await prisma.staff.update({
        where: { id: input.staffId },
        data: {
          roleId: input.roleId,
        },
        include: {
          role: true,
        },
      });

      const newRole = updated.role?.name || "Aucun";

      // Log Discord
      await discordLog("INFO", {
        title: "🔄 Changement de Rôle Staff",
        description: `Le rôle d'un membre staff a été modifié.`,
        fields: [
          {
            name: "Utilisateur",
            value: staff.user.username ?? "Inconnu",
            inline: true,
          },
          {
            name: "Ancien rôle",
            value: oldRole,
            inline: true,
          },
          {
            name: "Nouveau rôle",
            value: newRole,
            inline: true,
          },
          {
            name: "Modifié par",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return { success: true, staff: updated };
    }),

  /**
   * ACTION: Enregistrer une absence ou un retard
   */
  addAbsence: protectedProcedure
    .input(
      z.object({
        staffId: z.string(),
        type: z.enum(["ABSENCE", "DELAY"]),
        date: z.date(),
        reason: z.string().optional(),
        duration: z.number().int().positive().optional(), // En minutes pour les retards
      })
    )
    .mutation(async ({ input, ctx }) => {
      const absence = await prisma.staffAbsence.create({
        data: {
          staffId: input.staffId,
          type: input.type,
          date: input.date,
          reason: input.reason,
          duration: input.duration,
          authorId: ctx.session.user.id as string,
        },
        include: {
          staff: {
            include: {
              user: { select: { username: true } },
            },
          },
        },
      });

      // Log Discord
      await discordLog("WARN", {
        title: `📅 ${
          input.type === "ABSENCE" ? "Absence" : "Retard"
        } Enregistré`,
        description: `Une ${
          input.type === "ABSENCE" ? "absence" : "retard"
        } a été enregistrée.`,
        fields: [
          {
            name: "Staff",
            value: absence.staff.user.username ?? "Inconnu",
            inline: true,
          },
          {
            name: "Type",
            value: input.type,
            inline: true,
          },
          {
            name: "Date",
            value: input.date.toLocaleDateString("fr-FR"),
            inline: true,
          },
          ...(input.duration
            ? [
                {
                  name: "Durée",
                  value: `${input.duration} minutes`,
                  inline: true,
                },
              ]
            : []),
          ...(input.reason
            ? [{ name: "Raison", value: input.reason, inline: false }]
            : []),
          {
            name: "Enregistré par",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
        ],
      });

      return absence;
    }),

  /**
   * VIEW: Récupérer les absences/retards d'un staff
   */
  getAbsences: protectedProcedure
    .input(
      z.object({
        staffId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.staffAbsence.findMany({
        where: {
          staffId: input.staffId,
          ...(input.startDate || input.endDate
            ? {
                date: {
                  ...(input.startDate ? { gte: input.startDate } : {}),
                  ...(input.endDate ? { lte: input.endDate } : {}),
                },
              }
            : {}),
        },
        include: {
          staff: {
            include: {
              user: { select: { username: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      });
    }),
});
