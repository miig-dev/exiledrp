/**
 * Script pour créer la table Account nécessaire pour NextAuth
 * Exécutez avec: bun run scripts/create-account-table.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["info", "warn", "error"],
});

async function createAccountTable() {
  try {
    console.log("🔧 Création de la table Account...");

    // Créer la table Account avec Prisma raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,

        CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log("✅ Table Account créée");

    // Créer l'index unique
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" 
      ON "Account"("provider", "providerAccountId");
    `);

    console.log("✅ Index unique créé");

    // Créer l'index sur userId
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Account_userId_idx" 
      ON "Account"("userId");
    `);

    console.log("✅ Index userId créé");

    // Vérifier si la table User existe avant d'ajouter la contrainte
    const userTableExists = await prisma.$queryRawUnsafe<
      Array<{ exists: boolean }>
    >(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      ) as exists;
    `);

    if (userTableExists[0]?.exists) {
      // Ajouter la contrainte de clé étrangère seulement si User existe
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'Account_userId_fkey'
          ) THEN
            ALTER TABLE "Account" 
            ADD CONSTRAINT "Account_userId_fkey" 
            FOREIGN KEY ("userId") 
            REFERENCES "User"("id") 
            ON DELETE CASCADE 
            ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
      console.log("✅ Contrainte de clé étrangère ajoutée");
    } else {
      console.log(
        "⚠️  Table User n'existe pas encore, contrainte de clé étrangère ignorée"
      );
      console.log(
        "   Vous devrez l'ajouter manuellement après la création de la table User"
      );
    }
    console.log("🎉 Table Account créée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la création de la table:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAccountTable()
  .then(() => {
    console.log("✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });
