import { auth } from "@/lib/auth";
import {
  fetchDiscordUserRoles,
  syncDiscordRolesWithPrisma,
} from "@/lib/discord-roles";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le compte Discord de l'utilisateur
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "discord",
      },
    });

    if (!account?.accessToken || !account.accountId) {
      return NextResponse.json(
        { error: "Compte Discord non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer et synchroniser les rôles Discord
    const discordRoles = await fetchDiscordUserRoles(
      account.accessToken,
      account.accountId
    );
    const roleNames = await syncDiscordRolesWithPrisma(
      session.user.id,
      discordRoles
    );

    return NextResponse.json({
      success: true,
      roles: roleNames,
    });
  } catch (error) {
    console.error("Erreur lors de la synchronisation des rôles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation" },
      { status: 500 }
    );
  }
}
