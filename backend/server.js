require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createPool, closePool } = require('./config/database')
const { initializeFirebase } = require('./config/firebase')
const projectsRoutes = require('./routes/projects')
const trustedBrandsRoutes = require('./routes/trustedBrands')
const configRoutes = require('./routes/config')

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isLocalOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ByLoa Backend is running',
    timestamp: new Date().toISOString()
  })
})

// Register routes
app.use('/api', projectsRoutes)
app.use('/api', trustedBrandsRoutes)
app.use('/api', configRoutes)

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error.message)
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: error.message 
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not found' 
  })
})

// Graceful shutdown
const closeGracefully = async (signal) => {
  console.log(`\n${signal} received, closing gracefully...`)
  await closePool()
  process.exit(0)
}

process.on('SIGINT', () => closeGracefully('SIGINT'))
process.on('SIGTERM', () => closeGracefully('SIGTERM'))

// Start server
const start = async () => {
  try {
    await createPool()
    console.log('✅ Database connected')
    
    initializeFirebase()
    
    const port = process.env.PORT || 3000
    const host = process.env.HOST || '0.0.0.0'
    
    app.listen(port, host, () => {
      console.log(`🚀 ByLoa Backend running`)
      console.log(`📍 http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`)
      console.log(`🏥 Health check: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/health`)
    })
  } catch (err) {
    console.error('❌ Startup error:', err.message)
    process.exit(1)
  }
}

start()

module.exports = app
