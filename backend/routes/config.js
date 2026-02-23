const express = require('express')
const router = express.Router()

// Get admin email configuration
router.get('/config/admin-email', (req, res) => {
  try {
    const adminEmailEnv = process.env.ADMIN_EMAIL
    
    if (!adminEmailEnv) {
      console.warn('❌ ADMIN_EMAIL not configured in .env')
      return res.json({ 
        success: false, 
        error: 'ADMIN_EMAIL not configured',
        adminEmails: []
      })
    }
    
    const adminEmails = adminEmailEnv
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0)
    
    res.json({ 
      success: true, 
      adminEmails 
    })
  } catch (error) {
    console.error('❌ Error in admin-email endpoint:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      adminEmails: []
    })
  }
})

module.exports = router
