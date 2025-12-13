// src/lib/discord-logger.ts

/**
 * Utilitaire pour envoyer des logs Discord via Webhook
 * Supporte les couleurs, embeds, et champs structurés.
 */

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

type LogLevel = "INFO" | "WARN" | "ERROR" | "SUCCESS" | "CRITICAL";

const COLORS = {
  INFO: 0x3498db, // Bleu
  WARN: 0xf1c40f, // Jaune
  ERROR: 0xe74c3c, // Rouge
  SUCCESS: 0x2ecc71, // Vert
  CRITICAL: 0x992d22, // Rouge foncé
};

interface LogOptions {
  title: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  author?: { name: string; icon_url?: string };
  footer?: { text: string };
}

export const discordLog = async (level: LogLevel, options: LogOptions) => {
  if (!WEBHOOK_URL) {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ DISCORD_WEBHOOK_URL non défini !");
    }
    return;
  }

  const payload = {
    embeds: [
      {
        title: options.title,
        description: options.description,
        color: COLORS[level],
        fields: options.fields,
        author: options.author,
        footer: {
          text: `ExiledRP System • ${new Date().toLocaleString("fr-FR")}`,
          ...options.footer,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Erreur envoi Discord: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Erreur réseau Discord Log:", error);
}
};
