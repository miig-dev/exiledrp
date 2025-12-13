import { discordLog } from "@/lib/discord-logger";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const messageRouter = router({
  /**
   * INBOX: Boîte de réception
   */
  getInbox: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.mail.findMany({
      where: {
        receiverId: ctx.session.user.id,
        isDeleted: false,
        isArchived: false,
      },
      include: {
        sender: { select: { username: true, avatar: true } },
      },
          orderBy: { createdAt: "desc" },
        });
  }),

  /**
   * SENT: Boîte d'envoi
   */
  getSent: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.mail.findMany({
        where: {
        senderId: ctx.session.user.id,
        isDeleted: false,
      },
      include: {
        receiver: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
      });
  }),

  /**
   * READ: Lire un mail
   */
  getMail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const mail = await prisma.mail.findUnique({
        where: { id: input.id },
        include: {
          sender: { select: { username: true, avatar: true } },
          receiver: { select: { username: true, avatar: true } },
        },
      });

      if (!mail) throw new TRPCError({ code: "NOT_FOUND" });

      // Vérification permissions : Expéditeur ou Destinataire
      if (
        mail.senderId !== ctx.session.user.id &&
        mail.receiverId !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Marquer comme lu si c'est le destinataire
      if (mail.receiverId === ctx.session.user.id && !mail.isRead) {
        await prisma.mail.update({
          where: { id: mail.id },
          data: { isRead: true },
      });
    }

      return mail;
  }),

  /**
   * SEND: Envoyer un mail avec pièce jointe optionnelle
   */
  sendMail: protectedProcedure
    .input(
      z.object({
        receiverUsername: z.string(), // On cherche par pseudo pour simplifier l'UX "email"
        subject: z.string().min(1),
        content: z.string().min(1),
        attachmentUrl: z.string().url().optional(), // URL de la pièce jointe uploadée
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Trouver le destinataire
      const receiver = await prisma.user.findFirst({
        where: { username: input.receiverUsername },
      });

      if (!receiver) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Utilisateur introuvable",
        });
      }

      const mail = await prisma.mail.create({
          data: {
          senderId: ctx.session.user.id,
          receiverId: receiver.id,
          subject: input.subject,
            content: input.content,
          attachment: input.attachmentUrl,
          },
        });

      // Log Discord
      await discordLog("INFO", {
        title: "Nouveau Message Interne",
        description: `Un nouveau message interne a été envoyé.`,
        fields: [
          {
            name: "De",
            value: ctx.session.user.name || "Inconnu",
            inline: true,
          },
          {
            name: "À",
            value: receiver.username,
            inline: true,
          },
          { name: "Sujet", value: input.subject, inline: false },
          {
            name: "Pièce jointe",
            value: input.attachmentUrl ? "Oui" : "Non",
            inline: true,
          },
        ],
      });

      return { success: true, mail };
    }),

  /**
   * DELETE: Supprimer (Corbeille)
   */
  deleteMail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const mail = await prisma.mail.findUnique({
        where: { id: input.id },
      });

      if (!mail) throw new TRPCError({ code: "NOT_FOUND" });

      if (mail.receiverId === ctx.session.user.id) {
        await prisma.mail.update({
          where: { id: input.id },
          data: { isDeleted: true },
        });
      } else if (mail.senderId === ctx.session.user.id) {
        await prisma.mail.update({
          where: { id: input.id },
          data: { isDeleted: true },
        });
      } else {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return { success: true };
    }),

  /**
   * ARCHIVE: Archiver un mail
   */
  archiveMail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const mail = await prisma.mail.findUnique({
        where: { id: input.id },
        });

      if (!mail) throw new TRPCError({ code: "NOT_FOUND" });

      if (mail.receiverId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
        }

      await prisma.mail.update({
        where: { id: input.id },
        data: { isArchived: true },
      });

      return { success: true };
    }),
});
