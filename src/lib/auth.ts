import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000",
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      scope: [
        "email",
        "identify",
        "guilds",
        "guilds.join",
        "guilds.members.read",
        "role_connections.write",
      ],
    },
  },
  callbacks: {
    async signIn() {
      // Toujours autoriser la connexion, la synchronisation des rôles se fera via l'API
      return true;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Si l'URL est relative, la convertir en URL absolue
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Si l'URL est sur le même domaine, l'autoriser
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Sinon, rediriger vers /ios par défaut
      return `${baseUrl}/ios`;
    },
  },
});
