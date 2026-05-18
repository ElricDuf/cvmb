-- ============================================================
--  SEED DATA - CVMB BASE DE DONNÉES
-- ============================================================

-- Insertion des catégories
INSERT INTO categorie (nom, ordre) VALUES
  ('Gestion administrative et comptable', 1),
  ('Trésorerie et relations bancaires', 2),
  ('Activité commerciale et digitale', 3),
  ('Relation clients et fournisseurs', 4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CATÉGORIE 1 : Gestion administrative et comptable
-- ============================================================

-- TPE - Commerce
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Disposez-vous d''une comptabilité à jour et régulièrement tenue à jour ?', 'commerce', 'TPE', 100, 1, true),
  (1, 'Avez-vous mis en place un système de suivi budgétaire pour votre entreprise ?', 'commerce', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Non, pas du tout', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Partiellement', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Oui, complètement', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Artisan
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Avez-vous une personne responsable de l''administration en interne ?', 'artisan', 'TPE', 100, 1, true),
  (1, 'Utilisez-vous un logiciel de facturation pour gérer vos devis et factures ?', 'artisan', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Partiellement', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Oui, complètement', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Profession Libérale
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Avez-vous un système de gestion documentaire sécurisé pour vos dossiers clients ?', 'liberal', 'TPE', 100, 1, true),
  (1, 'Maintenez-vous une feuille de temps ou un suivi des activités ?', 'liberal', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Non, données éparses', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Partiellement organisées', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Oui, bien organisées', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Industrie
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Disposez-vous d''une procédure formalisée pour la clôture comptable mensuelle ?', 'industrial', 'TPE', 100, 1, true),
  (1, 'Archivez-vous régulièrement et en sécurité vos documents administratifs ?', 'industrial', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'En cours de mise en place', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Oui, formalisée', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Services
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Utilisez-vous un outil CRM ou de gestion administrative ?', 'services', 'TPE', 100, 1, true),
  (1, 'Avez-vous des processus écrits pour les tâches administratives critiques ?', 'services', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Non, tout en informel', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Partiellement', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Oui, formalisés', 100, 3);

-- PME - Commerce
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Disposez-vous d''un responsable administratif ou d''une équipe dédiée ?', 'commerce', 'PME', 100, 1, true),
  (1, 'Effectuez-vous des audits internes réguliers de vos processus administratifs ?', 'commerce', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Artisan
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Disposez-vous d''un logiciel de gestion ERP ou similaire ?', 'artisan', 'PME', 100, 1, true),
  (1, 'Vos collaborateurs ont-ils accès à une documentation des procédures ?', 'artisan', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Profession Libérale
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Avez-vous une procédure de gestion des dossiers confidentiels clients ?', 'liberal', 'PME', 100, 1, true),
  (1, 'Effectuez-vous un suivi régulier de la conformité réglementaire ?', 'liberal', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Industrie
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Avez-vous un service ou une personne dédiée au contrôle administratif ?', 'industrial', 'PME', 100, 1, true),
  (1, 'Vos procédures administratives sont-elles documentées et régulièrement revues ?', 'industrial', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Services
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (1, 'Disposez-vous d''une politique d''archivage numérique sécurisée ?', 'services', 'PME', 100, 1, true),
  (1, 'Avez-vous formalisé vos procédures de gestion administrative ?', 'services', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 1 AND secteur = 'services' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- ============================================================
-- CATÉGORIE 2 : Trésorerie et relations bancaires
-- ============================================================

-- TPE - Commerce
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous une ligne de crédit ou un découvert autorisé auprès de votre banque ?', 'commerce', 'TPE', 100, 1, true),
  (2, 'Maintenez-vous une trésorerie prévisionnelle pour les 3 prochains mois ?', 'commerce', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Artisan
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous renégocié vos conditions bancaires au cours des 2 dernières années ?', 'artisan', 'TPE', 100, 1, true),
  (2, 'Disposez-vous d''une réserve de trésorerie (fonds de roulement) ?', 'artisan', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 2), 'Non ou insuffisante', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 2), 'Oui, suffisante', 100, 2);

-- TPE - Profession Libérale
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous une relation stable avec votre banque ?', 'liberal', 'TPE', 100, 1, true),
  (2, 'Êtes-vous à jour de vos obligations fiscales et sociales ?', 'liberal', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Non, relations difficiles', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 2), 'Non, retards de paiement', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Industrie
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous des difficultés de trésorerie récurrentes ?', 'industrial', 'TPE', 100, 1, true),
  (2, 'Avez-vous mis en place un suivi des encaissements clients ?', 'industrial', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Oui, très souvent', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Occasionnelles', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Non', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Services
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Disposez-vous d''une assurance pour les défauts de paiement clients ?', 'services', 'TPE', 100, 1, true),
  (2, 'Vérifiez-vous la solvabilité de vos clients avant de signer un contrat ?', 'services', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'services' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'services' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Rarement', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Systématiquement', 100, 2);

-- PME - Commerce
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous diversifié vos relations bancaires ?', 'commerce', 'PME', 100, 1, true),
  (2, 'Effectuez-vous un suivi mensuel de votre trésorerie ?', 'commerce', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Artisan
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous établi des projections de trésorerie pour l''année ?', 'artisan', 'PME', 100, 1, true),
  (2, 'Disposez-vous de critères de performance financière formels ?', 'artisan', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Profession Libérale
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous évalué le besoin en financement pour votre développement ?', 'liberal', 'PME', 100, 1, true),
  (2, 'Recourez-vous à des instruments de financement innovants ?', 'liberal', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Industrie
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous optimisé votre cycle de paiement fournisseurs et clients ?', 'industrial', 'PME', 100, 1, true),
  (2, 'Disposez-vous d''une assurance crédit client ?', 'industrial', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Partiellement', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Services
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (2, 'Avez-vous en place un système de relance automatisé des impayés ?', 'services', 'PME', 100, 1, true),
  (2, 'Communiquez-vous régulièrement avec votre expert-comptable ?', 'services', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'services' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'services' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'services' AND taille = 'PME' AND ordre = 2), 'Rarement', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 2 AND secteur = 'services' AND taille = 'PME' AND ordre = 2), 'Oui, régulièrement', 100, 2);

-- ============================================================
-- CATÉGORIE 3 : Activité commerciale et digitale
-- ============================================================

-- TPE - Commerce
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Avez-vous une présence en ligne (site web ou réseaux sociaux) ?', 'commerce', 'TPE', 100, 1, true),
  (3, 'Utilisez-vous des outils d''analyse pour comprendre votre clientèle ?', 'commerce', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Basique', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Oui, développée', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Artisan
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Proposez-vous des services de prise de rendez-vous en ligne ?', 'artisan', 'TPE', 100, 1, true),
  (3, 'Utilisez-vous des outils de communication avec votre clientèle (mail, SMS) ?', 'artisan', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Profession Libérale
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Avez-vous un site web professionnel à jour ?', 'liberal', 'TPE', 100, 1, true),
  (3, 'Pratiquez-vous le télétravail ou offrez-vous des consultations à distance ?', 'liberal', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Industrie
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Avez-vous optimisé votre processus de production avec le digital ?', 'industrial', 'TPE', 100, 1, true),
  (3, 'Utilisez-vous des outils de gestion de stock ou de production ?', 'industrial', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Partiellement', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Services
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Vendez-vous vos services en ligne ?', 'services', 'TPE', 100, 1, true),
  (3, 'Utilisez-vous les réseaux sociaux pour votre marketing ?', 'services', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'services' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'services' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- PME - Commerce
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Disposez-vous d''une stratégie e-commerce développée ?', 'commerce', 'PME', 100, 1, true),
  (3, 'Avez-vous un responsable digital ou marketing en interne ?', 'commerce', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Artisan
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Avez-vous investis dans des outils CRM pour gérer votre clientèle ?', 'artisan', 'PME', 100, 1, true),
  (3, 'Avez-vous une stratégie digitale formalisée ?', 'artisan', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Profession Libérale
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Utilisez-vous des outils collaboratifs pour votre équipe ?', 'liberal', 'PME', 100, 1, true),
  (3, 'Avez-vous une stratégie de contenu pour démontrer votre expertise ?', 'liberal', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Industrie
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Avez-vous intégré l''Industrie 4.0 dans vos processus ?', 'industrial', 'PME', 100, 1, true),
  (3, 'Disposez-vous d''une plateforme de vente ou B2B en ligne ?', 'industrial', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Partiellement', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Services
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (3, 'Mesurez-vous l''impact de vos actions marketing ?', 'services', 'PME', 100, 1, true),
  (3, 'Avez-vous un plan de transformation digital ?', 'services', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'services' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'services' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'services' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 3 AND secteur = 'services' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- ============================================================
-- CATÉGORIE 4 : Relation clients et fournisseurs
-- ============================================================

-- TPE - Commerce
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Avez-vous un programme de fidélité pour vos clients ?', 'commerce', 'TPE', 100, 1, true),
  (4, 'Recueillez-vous régulièrement les avis clients ?', 'commerce', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'commerce' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Artisan
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Disposez-vous d''une base de données de vos clients ?', 'artisan', 'TPE', 100, 1, true),
  (4, 'Avez-vous formalisé vos conditions générales avec les fournisseurs ?', 'artisan', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Basique', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 1), 'Oui, structurée', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Profession Libérale
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Maintenez-vous un suivi individuel de vos clients ?', 'liberal', 'TPE', 100, 1, true),
  (4, 'Faites-vous signer des contrats ou conditions formelles avec vos clients ?', 'liberal', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Industrie
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Avez-vous des relations stables à long terme avec vos principaux fournisseurs ?', 'industrial', 'TPE', 100, 1, true),
  (4, 'Évaluez-vous la performance de vos fournisseurs ?', 'industrial', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'industrial' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- TPE - Services
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Avez-vous des partenaires ou fournisseurs stables ?', 'services', 'TPE', 100, 1, true),
  (4, 'Contractualisez-vous vos relations commerciales ?', 'services', 'TPE', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'services' AND taille = 'TPE' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'services' AND taille = 'TPE' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'services' AND taille = 'TPE' AND ordre = 2), 'Oui', 100, 2);

-- PME - Commerce
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Avez-vous un processus structuré pour la gestion des réclamations clients ?', 'commerce', 'PME', 100, 1, true),
  (4, 'Disposez-vous d''un système de notation des fournisseurs ?', 'commerce', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'commerce' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Artisan
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Avez-vous diversifié votre base clients ?', 'artisan', 'PME', 100, 1, true),
  (4, 'Avez-vous un responsable commercial ou relation clients ?', 'artisan', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 1), 'Non, trop concentrée', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'artisan' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Profession Libérale
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Avez-vous formalisé votre offre de services (tarification, conditions) ?', 'liberal', 'PME', 100, 1, true),
  (4, 'Collaborez-vous avec d''autres professionnels pour enrichir votre offre ?', 'liberal', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Partiellement', 50, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 3),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'liberal' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Industrie
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Avez-vous des contrats fournisseurs sur plusieurs années ?', 'industrial', 'PME', 100, 1, true),
  (4, 'Avez-vous une stratégie d''amélioration continue avec les fournisseurs ?', 'industrial', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'industrial' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);

-- PME - Services
INSERT INTO question (categorie_id, texte, secteur, taille, points_max, ordre, active) VALUES
  (4, 'Mesurez-vous la satisfaction client de façon régulière ?', 'services', 'PME', 100, 1, true),
  (4, 'Avez-vous une stratégie de partenariat et de networking ?', 'services', 'PME', 100, 2, true);

INSERT INTO reponse_possible (question_id, texte, points, ordre) VALUES
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'services' AND taille = 'PME' AND ordre = 1), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'services' AND taille = 'PME' AND ordre = 1), 'Oui', 100, 2),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'services' AND taille = 'PME' AND ordre = 2), 'Non', 0, 1),
  ((SELECT id FROM question WHERE categorie_id = 4 AND secteur = 'services' AND taille = 'PME' AND ordre = 2), 'Oui', 100, 2);
