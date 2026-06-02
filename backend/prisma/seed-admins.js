// ============================================================
//  SEED ADMINS / CCI / DONNÉES DE DÉMO — CVMB
//  Crée des CCI, des comptes admin (local + national) et un jeu
//  de diagnostics de démonstration pour alimenter les dashboards.
//
//  Lancer :  node prisma/seed-admins.js
//  (ou  npm run db:seed:admins  depuis le dossier backend)
// ============================================================

require('dotenv').config()
const { randomBytes, scryptSync } = require('crypto')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Même algorithme que server.js (scrypt, format "salt:hash").
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

const SECTEURS = ['commerce', 'artisan', 'liberal', 'industrial', 'services']
const NIVEAUX = [
  { min: 0, max: 39, label: 'Fragilité critique' },
  { min: 40, max: 69, label: 'Situation à surveiller' },
  { min: 70, max: 100, label: 'Situation stable' },
]

function niveauFromHealth(pct) {
  return (NIVEAUX.find((n) => pct >= n.min && pct <= n.max) || NIVEAUX[0]).label
}

async function upsertCci({ nom, code, region, estNational = false }) {
  return prisma.cci.upsert({
    where: { code },
    update: { nom, region, est_national: estNational },
    create: { nom, code, region, est_national: estNational },
  })
}

async function upsertUser({ email, password, prenom, nom, role, cciId, mustChange = false, actif = true }) {
  return prisma.utilisateur.upsert({
    where: { email },
    update: { prenom, nom, role, cci_id: cciId, actif, doit_modifier_mot_de_passe: mustChange },
    create: {
      email,
      mot_de_passe: hashPassword(password),
      prenom,
      nom,
      role,
      cci_id: cciId,
      actif,
      doit_modifier_mot_de_passe: mustChange,
    },
  })
}

async function main() {
  console.log('→ CCI...')
  const bordeaux = await upsertCci({
    nom: 'CCI Bordeaux Gironde',
    code: '33',
    region: 'Nouvelle-Aquitaine',
    estNational: true,
  })
  const paris = await upsertCci({ nom: 'CCI Paris Île-de-France', code: '75', region: 'Île-de-France' })
  const lyon = await upsertCci({ nom: 'CCI Lyon Métropole', code: '69', region: 'Auvergne-Rhône-Alpes' })

  console.log('→ Comptes admin...')
  // Mots de passe de démo (à changer en production !).
  const superAdmin = await upsertUser({
    email: 'superadmin@cvmb.fr',
    password: 'SuperAdmin123!',
    prenom: 'Super',
    nom: 'Admin',
    role: 'admin_national',
    cciId: bordeaux.id,
  })
  const adminLocal = await upsertUser({
    email: 'admin@cci33.fr',
    password: 'AdminCci123!',
    prenom: 'Admin',
    nom: 'Bordeaux',
    role: 'admin_local',
    cciId: bordeaux.id,
  })
  await upsertUser({
    email: 'admin@cci75.fr',
    password: 'AdminCci123!',
    prenom: 'Admin',
    nom: 'Paris',
    role: 'admin_local',
    cciId: paris.id,
  })

  console.log(`   super-admin : superadmin@cvmb.fr / SuperAdmin123!`)
  console.log(`   admin local : admin@cci33.fr / AdminCci123!`)

  // -------- Données de démo : dirigeants + entreprises + diagnostics --------
  console.log('→ Diagnostics de démonstration...')

  // Catégories existantes (issues du seed principal) pour les scores par catégorie.
  const categories = await prisma.categorie.findMany({ orderBy: { ordre: 'asc' } })
  const categorieIds = categories.map((c) => c.id)

  const ccis = [bordeaux, paris, lyon]
  let created = 0

  for (let i = 1; i <= 18; i += 1) {
    const cci = ccis[i % ccis.length]
    const avecLogin = i % 3 !== 0 // ~2/3 avec login
    const demandeContact = i % 4 !== 0 // ~3/4 demandent un contact
    const email = `dirigeant.demo${i}@example.fr`

    const dirigeant = await prisma.utilisateur.upsert({
      where: { email },
      update: { cci_id: cci.id, doit_modifier_mot_de_passe: !avecLogin },
      create: {
        email,
        mot_de_passe: hashPassword('Demo123!'),
        prenom: 'Dirigeant',
        nom: `Démo ${i}`,
        role: 'dirigeant',
        cci_id: cci.id,
        doit_modifier_mot_de_passe: !avecLogin,
      },
    })

    const secteur = SECTEURS[i % SECTEURS.length]
    const taille = i % 2 === 0 ? 'PME' : 'TPE'
    const siret = String(10000000000000 + i)

    const entreprise = await prisma.entreprise.upsert({
      where: { siret },
      update: { cci_id: cci.id, demande_contact: demandeContact },
      create: {
        dirigeant_id: dirigeant.id,
        siret,
        raison_sociale: `Entreprise Démo ${i}`,
        code_postal: cci.code === '33' ? '33000' : cci.code === '75' ? '75001' : '69001',
        ville: cci.code === '33' ? 'Bordeaux' : cci.code === '75' ? 'Paris' : 'Lyon',
        secteur,
        taille,
        effectif: 5 + i,
        annee_creation: 2015 + (i % 8),
        demande_contact: demandeContact,
        cci_id: cci.id,
      },
    })

    // Statut varié : la plupart terminés, quelques abandons / en cours.
    const statut = i % 7 === 0 ? 'abandonne' : i % 11 === 0 ? 'en_cours' : 'termine'
    const scoreMax = 600
    const healthPct = 20 + ((i * 13) % 75) // 20..94
    const scoreGlobal = Math.round((healthPct / 100) * scoreMax)

    // Évite les doublons si on relance le seed.
    const existing = await prisma.diagnostic.findFirst({
      where: { entreprise_id: entreprise.id },
    })
    if (existing) continue

    const createdAt = new Date(2024, (i % 12), 1 + (i % 27))

    await prisma.diagnostic.create({
      data: {
        entreprise_id: entreprise.id,
        statut,
        derniere_etape_atteinte:
          statut === 'termine' ? 'recommandations' : statut === 'en_cours' ? 'questionnaire' : 'identite_entreprise',
        score_global: statut === 'termine' ? scoreGlobal : null,
        niveau_difficulte: statut === 'termine' ? niveauFromHealth(healthPct) : null,
        cree_le: createdAt,
        termine_le: statut === 'termine' ? createdAt : null,
        scores_categories:
          statut === 'termine' && categorieIds.length
            ? {
                create: categorieIds.map((catId) => ({
                  categorie_id: catId,
                  score: Math.round((healthPct / 100) * 100),
                  score_max: 100,
                })),
              }
            : undefined,
      },
    })
    created += 1
  }

  console.log(`   ${created} diagnostics de démo créés.`)
  console.log('✅ Seed admin terminé.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
