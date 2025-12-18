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
    console.log('FIREBASE_PROJECT_ID:', FIREBASE_PROJECT_ID);
    console.log('FIREBASE_CLIENT_EMAIL:', FIREBASE_CLIENT_EMAIL);
    console.log('FIREBASE_PRIVATE_KEY:', FIREBASE_PRIVATE_KEY ? 'Exists' : 'Missing');
    console.log(process.env.JWT_SECRET);
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
