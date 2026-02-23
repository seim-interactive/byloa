const express = require('express')
const router = express.Router()
const { getConnection } = require('../config/database')
const { uploadToFirebase, deleteFromFirebase } = require('../services/uploadService')

// Get all trusted brands
router.get('/trusted-brands', async (req, res) => {
  try {
    const connection = await getConnection()
    const [rows] = await connection.query('SELECT * FROM trusted_brands ORDER BY created_at DESC')
    connection.release()
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get single trusted brand
router.get('/trusted-brands/:id', async (req, res) => {
  try {
    const { id } = req.params
    const connection = await getConnection()
    const [rows] = await connection.query('SELECT * FROM trusted_brands WHERE id = ?', [id])
    connection.release()
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Trusted brand not found' })
    }
    
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Upload logo to Firebase Storage
router.post('/trusted-brands/upload', async (req, res) => {
  try {
    const { dataUrl, fileName } = req.body

    if (!dataUrl || !fileName) {
      return res.status(400).json({ success: false, error: 'Missing required fields: dataUrl, fileName' })
    }

    const logoUrl = await uploadToFirebase(dataUrl, 'image', fileName)

    res.json({
      success: true,
      data: {
        logoUrl,
        fileName
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create trusted brand
router.post('/trusted-brands', async (req, res) => {
  try {
    const { name, logo_url } = req.body
    
    if (!name || !logo_url) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, logo_url' })
    }
    
    const connection = await getConnection()
    const [result] = await connection.query(
      'INSERT INTO trusted_brands (name, logo_url) VALUES (?, ?)',
      [name, logo_url]
    )
    connection.release()
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId, 
        name, 
        logo_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } 
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Update trusted brand
router.put('/trusted-brands/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, logo_url } = req.body
    
    if (!name || !logo_url) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, logo_url' })
    }
    
    const connection = await getConnection()
    
    const [existing] = await connection.query('SELECT id FROM trusted_brands WHERE id = ?', [id])
    if (existing.length === 0) {
      connection.release()
      return res.status(404).json({ success: false, error: 'Trusted brand not found' })
    }
    
    await connection.query(
      'UPDATE trusted_brands SET name = ?, logo_url = ? WHERE id = ?',
      [name, logo_url, id]
    )
    connection.release()
    
    res.json({ 
      success: true, 
      data: { 
        id, 
        name, 
        logo_url,
        updated_at: new Date().toISOString()
      } 
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Delete trusted brand
router.delete('/trusted-brands/:id', async (req, res) => {
  try {
    const { id } = req.params
    const connection = await getConnection()
    
    const [existing] = await connection.query('SELECT logo_url FROM trusted_brands WHERE id = ?', [id])
    if (existing.length === 0) {
      connection.release()
      return res.status(404).json({ success: false, error: 'Trusted brand not found' })
    }

    const logoUrl = existing[0].logo_url
    if (logoUrl) {
      try {
        await deleteFromFirebase(logoUrl)
      } catch (firebaseError) {
        console.warn('Warning: Could not delete file from Firebase:', firebaseError.message)
      }
    }
    
    await connection.query('DELETE FROM trusted_brands WHERE id = ?', [id])
    connection.release()
    
    res.json({ success: true, message: 'Trusted brand deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
