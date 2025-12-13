/**
 * Script pour ajouter la contrainte de clé étrangère Account -> User
 * Exécutez avec: bun run scripts/add-account-foreign-key.ts
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

async function addForeignKey() {
  try {
    console.log("🔧 Vérification de l'existence de la table User...");

    const userTableExists = await prisma.$queryRawUnsafe<
      Array<{ exists: boolean }>
    >(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      ) as exists;
    `);

    if (!userTableExists[0]?.exists) {
      console.log("❌ La table User n'existe pas encore");
      console.log(
        "   Créez d'abord toutes les tables avec Prisma migrate ou db push"
      );
      return;
    }

    console.log("✅ Table User trouvée");

    // Vérifier si la contrainte existe déjà
    const constraintExists = await prisma.$queryRawUnsafe<
      Array<{ exists: boolean }>
    >(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Account_userId_fkey'
      ) as exists;
    `);

    if (constraintExists[0]?.exists) {
      console.log("✅ La contrainte de clé étrangère existe déjà");
      return;
    }

    console.log("🔧 Ajout de la contrainte de clé étrangère...");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Account" 
      ADD CONSTRAINT "Account_userId_fkey" 
      FOREIGN KEY ("userId") 
      REFERENCES "User"("id") 
      ON DELETE CASCADE 
      ON UPDATE CASCADE;
    `);

    console.log("✅ Contrainte de clé étrangère ajoutée avec succès !");
  } catch (error) {
    console.error("❌ Erreur:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addForeignKey()
  .then(() => {
    console.log("✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });
