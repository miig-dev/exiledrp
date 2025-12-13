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

## 1. Fondations & Infrastructure

- [x] Initialiser le projet avec Bun, Next.js, TypeScript
- [x] Mettre en place Tailwind CSS et Shadcn/ui (Style Cyber Ciel Bleu)
- [x] Configurer tRPC pour l’API typesafe (Router racine, Context, Provider)
- [x] Écrire le schéma Prisma complet
  - [x] Core: User, Role, Staff
  - [x] Métiers: Job, JobGrade, JobMember
  - [x] Urgences: EmergencyCall
  - [x] Staff: StaffNote, StaffSanction
  - [x] Système: Log, Message
- [x] Générer le client Prisma
- [x] Intégrer Auth.js (NextAuth.js) avec Adapter Prisma
- [x] Sécuriser les routes via Middleware (Protection /ios, /dashboard)

## 2. Logique Métier (Backend tRPC)

- [x] **JobRouter V1** : CRUD Métiers, Grades, Recrutement, "MyJobs"
- [x] **EmergencyRouter V1** : Création appels, Liste active, Prise en charge, Clôture
- [x] **StaffRouter (Type Pronote)** :
  - [x] Fiche staff complète, suivi comportement
  - [x] Notes internes et Sanctions
  - [ ] Stats de performance (à enrichir)
- [x] **AnimationRouter Avancé** :
  - [x] CRUD Animations avec status (planif/cours/terminé)
  - [x] Gestion participants et staff assigné
  - [ ] Stats (moyenne hebdo, staff le plus actif) (à enrichir)
- [x] **MessageRouter (Interne)** :
  - [x] Envoi, Réception, Archivage, Suppression
  - [ ] Système de pièces jointes (lien vers storage) (à implémenter)
- [x] **JobRouter V2 (Avancé)** :
  - [x] Rapports d'intervention
  - [x] Prise de service (Dispo/Indispo/Mission)
  - [x] Stats métiers (Taux présence, courbes)

## 3. Interface Utilisateur (Frontend)

- [x] Site Public (Accueil, Règlement, etc.) - _Structure faite, contenu à enrichir_
- [x] **Espace "Exiled IOS" (Windows 11 Style)**
  - [x] Bureau avec icônes dynamiques
  - [x] Barre des tâches stylée
  - [x] Système de fenêtres (Glassmorphism)
- [x] **Applications Internes (Connectées tRPC)**
  - [x] App "Profession Center" (Pôle Métiers)
  - [x] App "Urgence Live" (Tableau de bord temps réel)
  - [x] App "Animation Center"
  - [x] App "Staff Center" (Pour Gestion/Direction)
  - [x] App "Messagerie" (Outlook style)

## 4. Services Transverses

- [x] **Système de Logs Discord Centralisé**
  - [x] Webhook manager global (`src/lib/discord-logger.ts`)
  - [x] Triggers automatiques sur chaque action sensible (intégré dans StaffRouter)
- [x] **Pôle Direction & Gestion**
  - [x] Dashboard global (Vue d'ensemble) - _Dashboard Direction avec stats complètes_
  - [x] Outils d'admin (Maintenance, User management) - _Dashboard Gestion avec CRUD staff_

## 5. Déploiement & Doc

- [x] Générer la documentation complète (README final) - _README.md mis à jour avec config_
- [ ] Scripts de déploiement

# Points manquants / à prioriser

1.  ~~Frontend IOS (Le gros morceau UI)~~ ✅ **TERMINÉ**
2.  ~~Complétion des routeurs tRPC (Logique métier fine)~~ ✅ **TERMINÉ** (à enrichir avec stats avancées)
3.  ~~Logs Discord (Indispensable pour la tracabilité)~~ ✅ **TERMINÉ**

# Prochaines étapes

1. ~~**Enrichir les stats** : Ajouter statistiques avancées dans AnimationRouter et StaffRouter~~ ✅ **TERMINÉ**
2. ~~**Pièces jointes** : Implémenter le système de pièces jointes pour la messagerie~~ ✅ **TERMINÉ**
3. ~~**Dashboard Direction/Gestion** : Compléter les pages `/ios/direction` et `/ios/gestion`~~ ✅ **TERMINÉ**
4. **Scripts de déploiement** : Créer les scripts pour déploiement production
5. **Tests & Optimisations** : Tests E2E, optimisations performances
