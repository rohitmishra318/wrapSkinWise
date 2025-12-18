const admin = require('../config/firebaseAdmin');

/**
 * Firebase Auth Middleware
 * - Verifies Firebase ID Token
 * - Attaches Firebase user to req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];

    // 2️⃣ Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded Firebase token:', decodedToken);
    /**
     * decodedToken contains:
     * {
     *   uid,
     *   email,
     *   name,
     *   picture,
     *   auth_time,
     *   exp,
     *   ...
     * }
     */

    // 3️⃣ Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || null,
    };

    // 4️⃣ Continue
    next();

  } catch (error) {
    console.error('Firebase Auth Error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
