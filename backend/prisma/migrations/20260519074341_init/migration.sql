/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "cci" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "region" VARCHAR(100),
    "est_national" BOOLEAN NOT NULL DEFAULT false,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cci_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "prenom" VARCHAR(100),
    "nom" VARCHAR(100),
    "telephone" VARCHAR(20),
    "role" VARCHAR(30) NOT NULL,
    "cci_id" INTEGER,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "derniere_connexion" TIMESTAMP(3),
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entreprise" (
    "id" SERIAL NOT NULL,
    "dirigeant_id" INTEGER NOT NULL,
    "siret" VARCHAR(14),
    "raison_sociale" VARCHAR(255),
    "code_postal" VARCHAR(10),
    "secteur" VARCHAR(50),
    "taille" VARCHAR(10),
    "effectif" INTEGER,
    "chiffre_affaires" DECIMAL(15,2),
    "resultat_net" DECIMAL(15,2),
    "cci_id" INTEGER NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mis_a_jour_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorie" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" SERIAL NOT NULL,
    "categorie_id" INTEGER NOT NULL,
    "texte" TEXT NOT NULL,
    "secteur" VARCHAR(50),
    "taille" VARCHAR(10),
    "points_max" INTEGER NOT NULL DEFAULT 100,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reponse_possible" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "texte" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "reponse_possible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic" (
    "id" SERIAL NOT NULL,
    "entreprise_id" INTEGER NOT NULL,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'en_cours',
    "derniere_etape_atteinte" VARCHAR(100),
    "score_global" INTEGER,
    "niveau_difficulte" VARCHAR(50),
    "pdf_url" VARCHAR(500),
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "termine_le" TIMESTAMP(3),

    CONSTRAINT "diagnostic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reponse_diagnostic" (
    "id" SERIAL NOT NULL,
    "diagnostic_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "reponse_possible_id" INTEGER,
    "points_obtenus" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "reponse_diagnostic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_categorie" (
    "id" SERIAL NOT NULL,
    "diagnostic_id" INTEGER NOT NULL,
    "categorie_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "score_max" INTEGER NOT NULL,

    CONSTRAINT "score_categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_recommandation" (
    "id" SERIAL NOT NULL,
    "secteur" VARCHAR(50),
    "taille" VARCHAR(10),
    "categorie_id" INTEGER,
    "score_min" INTEGER NOT NULL,
    "score_max" INTEGER NOT NULL,
    "titre" VARCHAR(200),
    "message" TEXT NOT NULL,
    "orientation" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_recommandation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendez_vous" (
    "id" SERIAL NOT NULL,
    "diagnostic_id" INTEGER NOT NULL,
    "conseiller_id" INTEGER,
    "creneau_souhaite" VARCHAR(100),
    "informations_complementaires" TEXT,
    "statut" VARCHAR(30) NOT NULL DEFAULT 'demande',
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mis_a_jour_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rendez_vous_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cci_code_key" ON "cci"("code");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "entreprise_siret_key" ON "entreprise"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "reponse_diagnostic_diagnostic_id_question_id_key" ON "reponse_diagnostic"("diagnostic_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "score_categorie_diagnostic_id_categorie_id_key" ON "score_categorie"("diagnostic_id", "categorie_id");

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_cci_id_fkey" FOREIGN KEY ("cci_id") REFERENCES "cci"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entreprise" ADD CONSTRAINT "entreprise_dirigeant_id_fkey" FOREIGN KEY ("dirigeant_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entreprise" ADD CONSTRAINT "entreprise_cci_id_fkey" FOREIGN KEY ("cci_id") REFERENCES "cci"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponse_possible" ADD CONSTRAINT "reponse_possible_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic" ADD CONSTRAINT "diagnostic_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponse_diagnostic" ADD CONSTRAINT "reponse_diagnostic_diagnostic_id_fkey" FOREIGN KEY ("diagnostic_id") REFERENCES "diagnostic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponse_diagnostic" ADD CONSTRAINT "reponse_diagnostic_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponse_diagnostic" ADD CONSTRAINT "reponse_diagnostic_reponse_possible_id_fkey" FOREIGN KEY ("reponse_possible_id") REFERENCES "reponse_possible"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_categorie" ADD CONSTRAINT "score_categorie_diagnostic_id_fkey" FOREIGN KEY ("diagnostic_id") REFERENCES "diagnostic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_categorie" ADD CONSTRAINT "score_categorie_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_recommandation" ADD CONSTRAINT "message_recommandation_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_diagnostic_id_fkey" FOREIGN KEY ("diagnostic_id") REFERENCES "diagnostic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_conseiller_id_fkey" FOREIGN KEY ("conseiller_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
