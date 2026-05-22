ALTER TABLE "utilisateur"
ADD COLUMN "doit_modifier_mot_de_passe" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "entreprise"
ADD COLUMN "ville" VARCHAR(120),
ADD COLUMN "effectif_texte" VARCHAR(50),
ADD COLUMN "annee_creation" INTEGER,
ADD COLUMN "demande_contact" BOOLEAN NOT NULL DEFAULT true;
