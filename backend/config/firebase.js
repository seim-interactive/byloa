const admin = require('firebase-admin')

let firebaseApp = null

const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
      throw new Error(
        'Missing Firebase env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET'
      )
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      }),
      storageBucket
    })

    console.log('✅ Firebase initialized')
    return firebaseApp
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message)
    throw error
  }
}

const getStorage = () => {
  if (!firebaseApp) {
    initializeFirebase()
  }
  return admin.storage()
}

const getBucket = () => {
  if (!firebaseApp) {
    initializeFirebase()
  }
  return admin.storage().bucket()
}

module.exports = {
  initializeFirebase,
  getStorage,
  getBucket
}
