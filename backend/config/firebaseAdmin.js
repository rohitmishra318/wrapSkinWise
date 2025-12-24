const admin = require('firebase-admin');
require('dotenv').config();

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

const privateKey = FIREBASE_PRIVATE_KEY
  ? FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !privateKey) {
  throw new Error(
    'Missing Firebase service account environment variables. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are set.'
  );
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

module.exports = admin;
