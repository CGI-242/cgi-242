/*
  Warnings:

  - You are about to drop the column `embedding` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `titre_section` on the `articles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ArticleStatut" AS ENUM ('EN_VIGUEUR', 'ABROGE', 'MODIFIE');

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "embedding",
DROP COLUMN "titre_section",
ADD COLUMN     "embeddingId" TEXT,
ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pageDebut" INTEGER,
ADD COLUMN     "pageFin" INTEGER,
ADD COLUMN     "statut" "ArticleStatut" NOT NULL DEFAULT 'EN_VIGUEUR',
ADD COLUMN     "tome" TEXT;

-- CreateIndex
CREATE INDEX "articles_tome_livre_chapitre_idx" ON "articles"("tome", "livre", "chapitre");

-- CreateIndex
CREATE INDEX "articles_statut_idx" ON "articles"("statut");
