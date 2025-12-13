# Configuration des Rôles Discord

## Problème actuel

Les rôles Discord ne sont pas récupérés car `DISCORD_GUILD_ID` n'est pas configuré dans le fichier `.env`.

## Solution

### 1. Obtenir le Guild ID (ID du serveur Discord)

1. **Activer le mode développeur Discord** :

   - Ouvrez Discord
   - Allez dans **Paramètres utilisateur** > **Avancé**
   - Activez **Mode développeur**

2. **Récupérer l'ID du serveur** :
   - Cliquez droit sur votre serveur Discord
   - Cliquez sur **Copier l'ID**
   - C'est votre `DISCORD_GUILD_ID`

### 2. Ajouter dans `.env`

Ajoutez cette ligne dans votre fichier `.env` :

```env
DISCORD_GUILD_ID=votre_guild_id_ici
```

### 3. (Optionnel) Créer un Bot Discord pour améliorer la récupération

Pour une meilleure récupération des rôles, créez un bot :

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application ou utilisez celle existante
3. Allez dans l'onglet **Bot**
4. Créez un bot et récupérez le **Token**
5. Ajoutez le bot à votre serveur Discord avec les permissions :
   - **Lire les membres du serveur**
   - **Voir les rôles**
6. Ajoutez dans `.env` :

```env
DISCORD_BOT_TOKEN=votre_bot_token_ici
```

### 4. Vérifier les scopes OAuth2

Dans votre application Discord (Discord Developer Portal) :

1. Allez dans **OAuth2** > **URLs de redirection**
2. Ajoutez : `http://localhost:3000/api/auth/callback/discord`
3. Dans **Scopes**, assurez-vous d'avoir :
   - ✅ `identify`
   - ✅ `email`
   - ✅ `guilds`
   - ✅ `guilds.members.read`

### 5. Redémarrer le serveur

```bash
bun dev
```

### 6. Se reconnecter

Déconnectez-vous et reconnectez-vous pour synchroniser les rôles Discord.

## Vérification

Après la connexion, vous devriez voir :

- ✅ Redirection automatique vers `/ios`
- ✅ Rôles Discord affichés dans le dashboard
- ✅ Image de profil Discord affichée
- ✅ Logs dans la console : `✅ Rôles synchronisés: ...`

## Dépannage

Si les rôles ne s'affichent toujours pas :

1. Vérifiez les logs dans la console du serveur
2. Vérifiez que `DISCORD_GUILD_ID` est bien dans `.env`
3. Vérifiez que vous êtes bien membre du serveur Discord
4. Vérifiez que les scopes OAuth2 sont correctement configurés
5. Vérifiez que le bot (si utilisé) a les bonnes permissions
