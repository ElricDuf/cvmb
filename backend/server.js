const express = require('express')
const app = express()
const port = process.env.PORT || 4000

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/users', (req, res) => {
  // Example endpoint; replace with Prisma DB calls
  res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }])
})

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
