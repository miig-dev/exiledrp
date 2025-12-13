# Migration de NextAuth vers Better Auth

## ✅ Modifications effectuées

### 1. Installation

- ✅ `better-auth` installé
- ✅ `next-auth` et `@auth/prisma-adapter` supprimés du `package.json`

### 2. Schéma Prisma

- ✅ Modèle `User` adapté pour Better Auth (champs `name`, `email`, `emailVerified`, `image`)
- ✅ Modèle `Account` adapté pour Better Auth (champs `accountId`, `providerId`, etc.)
- ✅ Modèle `Session` créé pour Better Auth
- ✅ Modèle `Verification` créé pour Better Auth
- ✅ Champs personnalisés conservés (`discordId`, `username`, `avatar`)

### 3. Configuration Better Auth

- ✅ `src/lib/auth.ts` : Configuration Better Auth avec Discord
- ✅ `app/api/auth/[...all]/route.ts` : Routes API Better Auth
- ✅ `src/lib/auth-client.ts` : Client React Better Auth

### 4. Composants mis à jour

- ✅ `app/ClientLayout.tsx` : Suppression de `SessionProvider`
- ✅ `app/auth/signin/page.tsx` : Utilisation de `signIn.social` Better Auth
- ✅ `app/profile/page.tsx` : Utilisation de `useSession` Better Auth
- ✅ `app/dashboard/page.tsx` : Utilisation de `useSession` Better Auth
- ✅ `app/ios/page.tsx` : Utilisation de `useSession` Better Auth

### 5. Middleware et tRPC

- ✅ `src/middleware.ts` : Utilisation de `auth.api.getSession` Better Auth
- ✅ `src/server/trpc.ts` : Utilisation de `auth.api.getSession` Better Auth
- ✅ `app/api/upload/mail/route.ts` : Utilisation de `auth.api.getSession` Better Auth

## 🔧 Configuration requise

### Variables d'environnement

Ajoutez dans votre `.env` :

```env
# Better Auth
BETTER_AUTH_SECRET=votre_secret_ici
BETTER_AUTH_URL=http://localhost:3000

# Discord OAuth (déjà configuré)
DISCORD_CLIENT_ID=1445694217618981036
DISCORD_CLIENT_SECRET=M_5WTLvQNAHuZmrSBK4ZV3YuVr1XjBwZ

# Optionnel (pour compatibilité)
NEXTAUTH_SECRET=votre_secret_ici
NEXTAUTH_URL=http://localhost:3000
```

### Générer BETTER_AUTH_SECRET

```bash
openssl rand -base64 32
```

## 📝 Prochaines étapes

1. **Ajouter `BETTER_AUTH_SECRET` dans `.env`**
2. **Redémarrer le serveur** : `bun dev`
3. **Tester la connexion Discord** : `/auth/signin`
4. **Vérifier la redirection** : devrait rediriger vers `/ios` après connexion

## 🔄 Différences avec NextAuth

### API

- **NextAuth** : `useSession()` de `next-auth/react`
- **Better Auth** : `useSession()` de `@/lib/auth-client`

### Routes API

- **NextAuth** : `/api/auth/[...nextauth]`
- **Better Auth** : `/api/auth/[...all]`

### Session côté serveur

- **NextAuth** : `getServerSession(authOptions)`
- **Better Auth** : `auth.api.getSession({ headers })`

### Schéma Prisma

- **NextAuth** : Modèle `Account` avec `type`, `provider`, `providerAccountId`
- **Better Auth** : Modèle `Account` avec `accountId`, `providerId`
- **Better Auth** : Modèle `Session` requis
- **Better Auth** : Modèle `Verification` requis

## ⚠️ Notes importantes

- Les rôles Discord doivent être synchronisés manuellement (à implémenter dans les callbacks Better Auth)
- La table `Account` a été migrée vers le format Better Auth
- Les sessions sont maintenant gérées par Better Auth dans la table `Session`
- Configuration simplifiée : Better Auth détecte automatiquement Prisma quand on passe l'instance directement

## 🔗 URL de redirection Discord

Dans le [Discord Developer Portal](https://discord.com/developers/applications), configurez l'URL de redirection :

- **Développement** : `http://localhost:3000/api/auth/callback/discord`
- **Production** : `https://votre-domaine.com/api/auth/callback/discord`
