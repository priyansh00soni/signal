import cors from 'cors'
import express from 'express'
import { machinesRouter } from './machines/machines.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

export const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'OK' })
})

app.use('/api/v1', machinesRouter)

// Order matters: unmatched routes -> notFound -> errorHandler, both
// mounted last so everything flows through one place.
app.use(notFound)
app.use(errorHandler)
