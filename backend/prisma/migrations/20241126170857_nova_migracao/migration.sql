/*
  Warnings:

  - You are about to drop the column `KM_Minimo` on the `motoristas` table. All the data in the column will be lost.
  - Added the required column `km_minimo` to the `motoristas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "motoristas" DROP COLUMN "KM_Minimo",
ADD COLUMN     "km_minimo" INTEGER NOT NULL;
