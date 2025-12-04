# Stack Technique Recommandée par le Vétéran

| Composant            | Technologie Recommandée                  | Rationnel du Vétéran (Pourquoi ce choix ?)                                                                                                                |
| :------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**         | **Next.js 14 (App Router)**              | Solution tout-en-un : pages statiques SEO + dashboard interactif. App Router = interfaces complexes et protégées par rôle.                                |
| **UI / Styling**     | **Tailwind CSS + shadcn/ui**             | Tailwind pour rapidité et design système cohérent (Cyber Ciel Bleu). shadcn/ui pour des composants accessibles et personnalisables. Gain de temps énorme. |
| **Backend**          | **Next.js API Routes**                   | API intégrée, pas de serveur séparé. Simple à déployer/maintenir. Idéal pour la logique métier des pôles.                                                 |
| **Base de Données**  | **PostgreSQL + Prisma ORM**              | PostgreSQL pour les relations complexes, robuste et scalable. Prisma pour un schéma clair et type-safe en TypeScript.                                     |
| **Authentification** | **Auth.js v5**                           | Référence moderne, gère connexions et rôles, sessions intégrées à Next.js. Essentiel pour staff/gestion/direction.                                        |
| **Temps Réel**       | **Server-Sent Events (SSE) via Next.js** | Pour messagerie et alertes : SSE plus simple que WebSockets, parfait pour push serveur-client (ex : nouveau message reçu).                                |

# Todo List stratégique Exiled RP (Stack Bun / Next.js / tRPC / Prisma / Auth.js)

- [x] Initialiser le projet avec Bun, Next.js, TypeScript
  - [x] Mettre en place le package manager Bun, scripts de dev et de build
  - [x] Créer la structure App Router Next.js (pages publiques et internes)
- [x] Mettre en place Tailwind CSS et Shadcn/ui
  - [x] Intégrer le style Cyber Ciel Bleu, Glassmorphism, composants UI réutilisables
- [x] Configurer tRPC pour l’API typesafe
  - [x] Créer la couche API interne, tous les modules passent par tRPC
- [x] Écrire le schéma Prisma complet
  - [x] Modéliser Animation, Job, JobMember, JobReport, JobStat, EmergencyCall, StaffNote, StaffSanction, Message
  - [x] Modéliser User (avec rôle), Staff, Fiche, Role, Log, Message
- [x] Générer et appliquer les migrations Prisma
- [ ] Intégrer Auth.js (NextAuth.js) avec Adapter Prisma
  - [ ] Gestion des sessions, rôles, middleware de protection des routes
- [ ] Protéger l’espace interne “Exiled IOS”
  - [ ] Middleware Next.js + Auth.js, redirection automatique selon rôle
- [ ] Développer les modules applicatifs internes
  - [ ] Messagerie interne (Mail, pièces jointes, logs Discord)
  - [ ] Animation Center (CRUD, stats, logs Discord)
  - [ ] Profession Center (gestion métiers, rapports, stats)
  - [ ] Emergency Live (appels, assignation, stats)
  - [ ] Staff Center (fiche staff, notes, sanctions)
- [ ] Implémenter les logs Discord via Cloud Functions (TypeScript)
  - [ ] Déclencher les logs sur toutes les actions sensibles
- [ ] Intégrer Firebase Storage pour les fichiers et assets
- [ ] Générer la documentation complète (README, .env, scripts Bun, déploiement)
- [ ] Fournir l’arborescence complète et tous les fichiers clés (TSX, TS, Prisma, JSON)

## Modules tRPC à créer

- [ ] AnimationRouter : gestion des animations (CRUD, stats)
- [ ] JobRouter : gestion des métiers, membres, rapports, stats
- [ ] EmergencyRouter : gestion des appels d’urgence, assignations
- [ ] StaffRouter : fiche staff, notes, sanctions
- [ ] MessageRouter : messagerie interne, pièces jointes
- [ ] LogRouter : logs Discord, actions sensibles

Chaque module tRPC doit être typé, sécurisé (middleware Auth.js) et exposer les opérations métier nécessaires.

# Points manquants / à prioriser

- tRPC : API interne et modules métiers
- Prisma : enrichir le schéma, générer les migrations
- Auth.js : gestion des rôles, protection des routes
- Modules internes : messagerie, animation, staff, emergency
- Logs Discord : via Cloud Functions
- Stockage fichiers : Firebase Storage
- Documentation et scripts de déploiement
