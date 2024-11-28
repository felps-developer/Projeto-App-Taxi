/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `visitantes` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "password";

-- DropTable
DROP TABLE "visitantes";

-- CreateTable
CREATE TABLE "motoristas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "carro" TEXT NOT NULL,
    "avaliacao" TEXT NOT NULL,
    "taxa" DOUBLE PRECISION NOT NULL,
    "KM_Minimo" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "motoristas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viagens" (
    "id" TEXT NOT NULL,
    "latitude_inicial" DOUBLE PRECISION NOT NULL,
    "latitude_final" DOUBLE PRECISION NOT NULL,
    "longitude_inicial" DOUBLE PRECISION NOT NULL,
    "longitude_final" DOUBLE PRECISION NOT NULL,
    "distancia" DOUBLE PRECISION NOT NULL,
    "tempo_percurso" INTEGER NOT NULL,
    "avaliacao_motorista" DOUBLE PRECISION NOT NULL,
    "comentario_motorista" TEXT NOT NULL,
    "valor_total" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "motoristaId" TEXT NOT NULL,

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
