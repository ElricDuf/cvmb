require('dotenv').config()
const { spawnSync } = require('child_process')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function run() {
  const migrateResult = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (migrateResult.status !== 0) {
    process.exit(migrateResult.status ?? 1)
  }

  const count = await prisma.categorie.count()

  if (count > 0) {
    console.log('Database already contains seed data, skipping seed step.')
    return
  }

  console.log('Database is empty, running seed...')

  const seedResult = spawnSync(process.execPath, [path.join(__dirname, 'seed.js')], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: false,
  })

  process.exit(seedResult.status ?? 0)
}

run()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })