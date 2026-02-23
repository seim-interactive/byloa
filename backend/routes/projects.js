const express = require('express')
const router = express.Router()
const { getConnection } = require('../config/database')
const { uploadToFirebase, deleteFromFirebase } = require('../services/uploadService')

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const connection = await getConnection()
    const [rows] = await connection.query('SELECT * FROM projects ORDER BY created_at DESC')
    connection.release()
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Get single project
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const connection = await getConnection()
    const [rows] = await connection.query('SELECT * FROM projects WHERE id = ?', [id])
    connection.release()
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }
    
    res.json({ success: true, data: rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Upload file to Firebase Storage
router.post('/upload', async (req, res) => {
  try {
    const { dataUrl, type, fileName } = req.body

    if (!dataUrl || !type || !fileName) {
      return res.status(400).json({ success: false, error: 'Missing required fields: dataUrl, type, fileName' })
    }

    if (!['image', 'video'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Type must be "image" or "video"' })
    }

    const mediaUrl = await uploadToFirebase(dataUrl, type, fileName)

    res.json({
      success: true,
      data: {
        mediaUrl,
        fileName
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Create project
router.post('/projects', async (req, res) => {
  try {
    const { title, type, media, link } = req.body
    
    if (!title || !type || !media || !link) {
      return res.status(400).json({ success: false, error: 'Missing required fields: title, type, media, link' })
    }
    
    if (!['image', 'video'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Type must be "image" or "video"' })
    }
    
    const connection = await getConnection()
    const [result] = await connection.query(
      'INSERT INTO projects (title, type, media, link) VALUES (?, ?, ?, ?)',
      [title, type, media, link]
    )
    connection.release()
    
    res.json({ 
      success: true, 
      data: { 
        id: result.insertId, 
        title, 
        type, 
        media, 
        link,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } 
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Update project
router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, type, media, link } = req.body
    
    if (!title || !type || !media || !link) {
      return res.status(400).json({ success: false, error: 'Missing required fields: title, type, media, link' })
    }
    
    if (!['image', 'video'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Type must be "image" or "video"' })
    }
    
    const connection = await getConnection()
    
    const [existing] = await connection.query('SELECT id FROM projects WHERE id = ?', [id])
    if (existing.length === 0) {
      connection.release()
      return res.status(404).json({ success: false, error: 'Project not found' })
    }
    
    await connection.query(
      'UPDATE projects SET title = ?, type = ?, media = ?, link = ? WHERE id = ?',
      [title, type, media, link, id]
    )
    connection.release()
    
    res.json({ 
      success: true, 
      data: { 
        id, 
        title, 
        type, 
        media, 
        link,
        updated_at: new Date().toISOString()
      } 
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Delete project
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params
    const connection = await getConnection()
    
    const [existing] = await connection.query('SELECT media FROM projects WHERE id = ?', [id])
    if (existing.length === 0) {
      connection.release()
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const mediaUrl = existing[0].media
    if (mediaUrl) {
      try {
        await deleteFromFirebase(mediaUrl)
      } catch (firebaseError) {
        console.warn('Warning: Could not delete file from Firebase:', firebaseError.message)
      }
    }
    
    await connection.query('DELETE FROM projects WHERE id = ?', [id])
    connection.release()
    
    res.json({ success: true, message: 'Project deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
