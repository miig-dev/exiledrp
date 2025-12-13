/**
 * Utilitaire pour récupérer et synchroniser les rôles Discord
 */

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface DiscordMember {
  roles: string[]; // IDs des rôles
}

/**
 * Récupère les rôles d'un utilisateur Discord depuis le serveur
 * Utilise l'endpoint OAuth2 qui nécessite le scope "guilds" et "guilds.members.read"
 */
export async function fetchDiscordUserRoles(
  accessToken: string,
  userId: string
): Promise<DiscordRole[]> {
  if (!DISCORD_GUILD_ID) {
    console.warn("⚠️ DISCORD_GUILD_ID non défini dans .env");
    return [];
  }

  try {
    // Essayer d'abord avec l'endpoint OAuth2 (utilisateur)
    const userMemberResponse = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    let member: DiscordMember | null = null;

    if (userMemberResponse.ok) {
      member = await userMemberResponse.json();
    } else if (
      userMemberResponse.status === 403 ||
      userMemberResponse.status === 404
    ) {
      // L'utilisateur n'est pas membre du serveur ou n'a pas les permissions
      console.warn(
        `Utilisateur ${userId} non membre du serveur Discord ou permissions insuffisantes (${userMemberResponse.status})`
      );
      return [];
    } else {
      // Essayer avec le bot token si disponible
      if (process.env.DISCORD_BOT_TOKEN) {
        const botMemberResponse = await fetch(
          `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}`,
          {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (botMemberResponse.ok) {
          member = await botMemberResponse.json();
        } else {
          console.warn(
            `Impossible de récupérer les rôles Discord pour ${userId}: ${botMemberResponse.status}`
          );
          return [];
        }
      } else {
        console.warn(
          `Impossible de récupérer les rôles Discord (${userMemberResponse.status}). DISCORD_BOT_TOKEN recommandé.`
        );
        return [];
      }
    }

    if (!member || !member.roles || member.roles.length === 0) {
      return [];
    }

    // Récupérer tous les rôles du serveur
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const rolesResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`,
      {
        headers: {
          Authorization: botToken ? `Bot ${botToken}` : `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!rolesResponse.ok) {
      console.warn(
        `Impossible de récupérer les rôles du serveur: ${rolesResponse.status}`
      );
      return [];
    }

    const allRoles: DiscordRole[] = await rolesResponse.json();

    // Filtrer les rôles que l'utilisateur possède
    const userRoles = allRoles.filter((role) => member.roles.includes(role.id));

    console.log(
      `✅ Rôles Discord récupérés pour ${userId}: ${userRoles
        .map((r) => r.name)
        .join(", ")}`
    );

    return userRoles;
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles Discord:", error);
    return [];
  }
}

/**
 * Synchronise les rôles Discord avec la base de données
 */
import { prisma } from "./prisma";

export async function syncDiscordRolesWithPrisma(
  userId: string,
  discordRoles: DiscordRole[]
): Promise<string[]> {
  const roleNames: string[] = [];

  for (const discordRole of discordRoles) {
    // Chercher ou créer le rôle dans la base de données
    let role = await prisma.role.findFirst({
      where: { discordId: discordRole.id },
    });

    if (!role) {
      // Si le rôle n'existe pas, le créer
      role = await prisma.role.create({
        data: {
          name: discordRole.name,
          discordId: discordRole.id,
        },
      });
    } else if (role.name !== discordRole.name) {
      // Mettre à jour le nom si différent
      role = await prisma.role.update({
        where: { id: role.id },
        data: { name: discordRole.name },
      });
    }

    roleNames.push(role.name);

    // Vérifier si l'utilisateur a déjà ce rôle
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (user && !user.roles.some((r: { id: string }) => r.id === role.id)) {
      // Ajouter le rôle à l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            connect: { id: role.id },
          },
        },
      });
    }
  }

  // Retirer les rôles Discord qui ne sont plus assignés
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (user) {
    const discordRoleIds = discordRoles.map((r) => r.id);
    const rolesToRemove = user.roles.filter(
      (r: { discordId: string | null }) =>
        r.discordId && !discordRoleIds.includes(r.discordId)
    );

    for (const roleToRemove of rolesToRemove) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            disconnect: { id: roleToRemove.id },
          },
        },
      });
    }
  }

  return roleNames;
}
