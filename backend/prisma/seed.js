require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(__dirname, 'seed.sql')
  const sql = fs.readFileSync(filePath, { encoding: 'utf8' })

  // Remove SQL comments and split into statements
  const lines = sql.split(/\r?\n/)
  const cleaned = lines.filter((l) => !l.trim().startsWith('--')).join('\n')
  const statements = cleaned.split(';').map(s => s.trim()).filter(s => s.length)

  console.log(`Found ${statements.length} statements to execute.`)

  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt)
    } catch (err) {
      console.error('Failed statement:', stmt.slice(0, 160))
      console.error(err)
      throw err
    }
  }

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
