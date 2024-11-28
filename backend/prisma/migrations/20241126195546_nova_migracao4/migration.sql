/*
  Warnings:

  - The primary key for the `motoristas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `motoristas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `viagens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `viagens` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `viagens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `motoristaId` on the `viagens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "viagens" DROP CONSTRAINT "viagens_motoristaId_fkey";

-- DropForeignKey
ALTER TABLE "viagens" DROP CONSTRAINT "viagens_userId_fkey";

-- AlterTable
ALTER TABLE "motoristas" DROP CONSTRAINT "motoristas_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "motoristas_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "viagens" DROP CONSTRAINT "viagens_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "motoristaId",
ADD COLUMN     "motoristaId" INTEGER NOT NULL,
ADD CONSTRAINT "viagens_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
