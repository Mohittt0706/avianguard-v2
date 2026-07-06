const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const env = require('./env');
const logger = require('../utils/logger');

let firebaseApp = null;

function initializeFirebase() {
  if (firebaseApp) return firebaseApp;

  try {
    const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');
    const serviceAccountPathAlt = path.resolve(__dirname, '../../../firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: env.FIREBASE_STORAGE_BUCKET || serviceAccount.project_id + '.appspot.com',
      });
      logger.info('[FIREBASE] Initialized with service account JSON file');
    } else if (fs.existsSync(serviceAccountPathAlt)) {
      const serviceAccount = require(serviceAccountPathAlt);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: env.FIREBASE_STORAGE_BUCKET || serviceAccount.project_id + '.appspot.com',
      });
      logger.info('[FIREBASE] Initialized with service account JSON file (alt path)');
    } else if (env.FIREBASE_PROJECT_ID && env.FIREBASE_PRIVATE_KEY && env.FIREBASE_CLIENT_EMAIL) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          privateKey: env.FIREBASE_PRIVATE_KEY,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
        }),
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
      });
      logger.info('[FIREBASE] Initialized with environment variables');
    } else {
      logger.warn('[FIREBASE] No credentials found. Push notifications will be disabled.');
      logger.warn('[FIREBASE] Place firebase-service-account.json in backend/ or backend/backend/ or set FIREBASE_* env vars.');
      return null;
    }

    return firebaseApp;
  } catch (err) {
    logger.error('[FIREBASE] Failed to initialize Firebase Admin SDK', err);
    return null;
  }
}

function getMessaging() {
  const app = initializeFirebase();
  if (!app) return null;
  return admin.messaging();
}

module.exports = { initializeFirebase, getMessaging, admin };
