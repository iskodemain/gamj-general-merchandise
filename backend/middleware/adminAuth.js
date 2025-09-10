import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized: Token missing or malformed." 
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { ID: decoded.ID };
    next();
    
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token. Please log in again." 
    });
  }
};

export default adminAuth;