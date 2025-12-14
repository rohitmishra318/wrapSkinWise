const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    console.log("Auth middleware triggered"); 
    console.log("Auth middleware: Request headers:", req.headers); 
  const authHeader = req.headers.authorization;
  console.log("Auth middleware: Authorization header:", authHeader); // Log the authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
    console.log("Auth middleware: Extracted token:", token); // Log the extracted token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; 
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;