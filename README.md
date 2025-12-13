# Exiled RP - Plateforme de Gestion Staff

Plateforme complète de gestion pour le serveur RP Exiled, incluant un site public et un espace interne sécurisé "Exiled IOS".

## Stack Technique

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: tRPC, Prisma ORM, PostgreSQL
- **Authentification**: Auth.js v5 (NextAuth.js) avec Discord OAuth
- **Styling**: Cyber Ciel Bleu (Mobile-First)

## Configuration Initiale

### 1. Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Configuration Discord OAuth
# Obtenez ces valeurs depuis https://discord.com/developers/applications
DISCORD_CLIENT_ID=votre_discord_client_id_here
DISCORD_CLIENT_SECRET=votre_discord_client_secret_here

# Base de données PostgreSQL
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/exiledrp

# NextAuth Secret (généré avec: openssl rand -base64 32)
NEXTAUTH_SECRET=votre_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Discord Webhook pour les logs (optionnel)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/votre_webhook_url

# Discord Guild ID (ID du serveur Discord pour synchroniser les rôles)
# Obtenez-le en activant le mode développeur Discord et en cliquant droit sur votre serveur > Copier l'ID
DISCORD_GUILD_ID=votre_guild_id_here

# Discord Bot Token (optionnel, pour récupérer les noms des rôles)
# Créez un bot sur https://discord.com/developers/applications et ajoutez-le à votre serveur
DISCORD_BOT_TOKEN=votre_bot_token_here
```

### 2. Configuration Discord OAuth

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Dans l'onglet "OAuth2", récupérez le **Client ID** et **Client Secret**
4. Ajoutez l'URL de redirection : `http://localhost:3000/api/auth/callback/discord`
5. Copiez les valeurs dans votre fichier `.env`

### 3. Base de Données

Assurez-vous que PostgreSQL est installé et en cours d'exécution, puis :

```bash
# Générer le client Prisma
bunx prisma generate

# Appliquer le schéma à la base de données
bunx prisma db push
# ou pour créer une migration
bunx prisma migrate dev
```

## Démarrage

```bash
# Installer les dépendances
bun install

# Lancer le serveur de développement
bun dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du Projet

- `/app` - Pages Next.js (App Router)
- `/src` - Code source (composants, librairies, serveurs)
- `/prisma` - Schéma Prisma et migrations
- `/src/server/routers` - Routeurs tRPC (logique métier)
- `/src/components` - Composants React réutilisables

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
