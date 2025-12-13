/**
 * Utilitaires pour gérer les utilisateurs via leurs comptes Discord
 */

import { prisma } from "./prisma";

/**
 * Trouve un utilisateur par son Discord ID
 */
export async function findUserByDiscordId(discordId: string) {
  return await prisma.user.findUnique({
    where: { discordId },
    include: {
      accounts: {
        where: { providerId: "discord" },
      },
    },
  });
}

/**
 * Trouve un utilisateur par son Discord ID ou son User ID
 * Utile pour les assignations qui peuvent utiliser l'un ou l'autre
 */
export async function findUserByIdentifier(
  identifier: string
): Promise<{ id: string; discordId: string | null } | null> {
  // Essayer d'abord par Discord ID
  const userByDiscord = await prisma.user.findUnique({
    where: { discordId: identifier },
    select: { id: true, discordId: true },
  });

  if (userByDiscord) {
    return userByDiscord;
  }

  // Sinon, essayer par User ID (UUID)
  const userById = await prisma.user.findUnique({
    where: { id: identifier },
    select: { id: true, discordId: true },
  });

  return userById;
}

/**
 * Récupère le Discord ID d'un utilisateur depuis son User ID
 */
export async function getDiscordIdFromUserId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { discordId: true },
  });

  return user?.discordId || null;
}

/**
 * Récupère le User ID depuis un Discord ID
 */
export async function getUserIdFromDiscordId(discordId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { discordId },
    select: { id: true },
  });

  return user?.id || null;
}

