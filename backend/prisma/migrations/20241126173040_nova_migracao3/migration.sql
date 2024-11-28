/*
  Warnings:

  - You are about to drop the column `comentario_motorista` on the `viagens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "viagens" DROP COLUMN "comentario_motorista",
ALTER COLUMN "avaliacao_motorista" SET DATA TYPE TEXT;
