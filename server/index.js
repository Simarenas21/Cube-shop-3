import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import payseraRouter from './paysera.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(payseraRouter)

// static build
const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))

// SPA fallback
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Serveris paleistas http://localhost:${PORT}`))
