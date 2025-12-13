// Cloud Function TypeScript pour envoyer un log sur Discord
import fetch from "node-fetch";

export async function sendDiscordLog({
  content,
  username = "ExiledRP Bot",
}: {
  content: string;
  username?: string;
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("DISCORD_WEBHOOK_URL non défini dans l'env");
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, username }),
  });
}
