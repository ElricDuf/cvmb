require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(__dirname, 'seed-recommendations.sql')
  const sql = fs.readFileSync(filePath, { encoding: 'utf8' })

  const lines = sql.split(/\r?\n/)
  const cleaned = lines.filter((line) => !line.trim().startsWith('--')).join('\n')
  const statements = cleaned
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

  console.log(`Found ${statements.length} recommendation statements to execute.`)

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement)
  }

  console.log('Recommendation messages seeded successfully.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
