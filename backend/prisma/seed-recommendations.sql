-- ============================================================
--  SEED DATA - RECOMMANDATIONS DIAGNOSTIC
--  Idempotent seed for message_recommandation only
-- ============================================================

DELETE FROM message_recommandation;

-- Global (categorie_id = NULL)
INSERT INTO message_recommandation (secteur, taille, categorie_id, score_min, score_max, titre, message, orientation) VALUES
  (NULL, NULL, NULL, 0, 24, 'Signes de fragilite critique', 'Le diagnostic global indique des fragilites majeures a traiter immediatement.', 'Prioriser un plan de stabilisation sur 30 jours avec points hebdomadaires.'),
  (NULL, NULL, NULL, 25, 49, 'Vigilance renforcee', 'Le diagnostic global montre plusieurs points de vigilance impactant la performance.', 'Mettre en place un plan d actions sur 90 jours avec indicateurs mensuels.'),
  (NULL, NULL, NULL, 50, 74, 'Situation intermediaire', 'Le diagnostic global est mitige, avec une base solide mais des axes de progression clairs.', 'Consolider les acquis et structurer 2 a 3 chantiers d amelioration prioritaires.'),
  (NULL, NULL, NULL, 75, 100, 'Situation stable', 'Le diagnostic global est satisfaisant et traduit une bonne maitrise des fondamentaux.', 'Maintenir la dynamique, formaliser les bonnes pratiques et anticiper les risques a 6 mois.');

-- Categorie 1 : Gestion administrative et comptable
INSERT INTO message_recommandation (secteur, taille, categorie_id, score_min, score_max, titre, message, orientation) VALUES
  (NULL, NULL, 1, 0, 49, 'Fragilite administrative', 'Les pratiques administratives et comptables sont insuffisamment structurees.', 'Formaliser les processus, fiabiliser les donnees et mettre en place un suivi mensuel.'),
  (NULL, NULL, 1, 50, 100, 'Maitrise administrative', 'Le pilotage administratif est globalement maitrise.', 'Automatiser les taches repetitives et renforcer le controle interne.');

-- Categorie 2 : Tresorerie et relations bancaires
INSERT INTO message_recommandation (secteur, taille, categorie_id, score_min, score_max, titre, message, orientation) VALUES
  (NULL, NULL, 2, 0, 49, 'Tension de tresorerie', 'Le pilotage de tresorerie est fragile et expose l activite a des risques de court terme.', 'Mettre en place un suivi de tresorerie hebdomadaire et un plan de relance des encaissements.'),
  (NULL, NULL, 2, 50, 100, 'Tresorerie sous controle', 'Le pilotage financier est satisfaisant et limite les risques de tension.', 'Affiner les previsions, optimiser le BFR et securiser les relations bancaires.');

-- Categorie 3 : Activite commerciale et digitale
INSERT INTO message_recommandation (secteur, taille, categorie_id, score_min, score_max, titre, message, orientation) VALUES
  (NULL, NULL, 3, 0, 49, 'Dynamique commerciale a renforcer', 'L activite commerciale et digitale manque de structuration et de pilotage.', 'Definir un plan d acquisition, des objectifs de conversion et un suivi des KPI.'),
  (NULL, NULL, 3, 50, 100, 'Dynamique commerciale solide', 'Les fondamentaux commerciaux sont presents et exploitables.', 'Industrialiser le suivi de performance et tester de nouveaux leviers de croissance.');

-- Categorie 4 : Relation clients et fournisseurs
INSERT INTO message_recommandation (secteur, taille, categorie_id, score_min, score_max, titre, message, orientation) VALUES
  (NULL, NULL, 4, 0, 49, 'Relations externes fragiles', 'La relation clients/fournisseurs presente des points de friction pouvant impacter l activite.', 'Formaliser les engagements, delais et revues de qualite avec les parties prenantes.'),
  (NULL, NULL, 4, 50, 100, 'Relations externes solides', 'Les relations clients/fournisseurs sont globalement stables et structurees.', 'Renforcer la fidelisation client et la performance fournisseurs via des revues periodiques.');

-- Exemple de regle specifique secteur/taille (prioritaire car plus specifique)
INSERT INTO message_recommandation (secteur, taille, categorie_id, score_min, score_max, titre, message, orientation) VALUES
  ('commerce', 'TPE', 2, 0, 49, 'Tension de tresorerie en commerce TPE', 'Pour une TPE du commerce, la tension de tresorerie est souvent liee aux stocks et delais d encaissement.', 'Prioriser la rotation des stocks, renegocier les conditions de paiement et accelerer les relances clients.');
