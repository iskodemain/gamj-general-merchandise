import jwt from 'jsonwebtoken';
import Staff from '../models/staff.js';

const staffAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized: Token missing or malformed." 
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_STAFF);

    const staffUser = await Staff.findByPk(decoded.ID);

    //----------------------------------------------------
    if (!staffUser || staffUser.forceLogout) {
      return res.status(401).json({
        success: false,
        forceLogout: true,
        message: "Your account has been removed."
      });
    }
    //----------------------------------------------------

    req.staff = { ID: decoded.ID };
    next();
    
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token. Please log in again." 
    });
  }
};

export default staffAuth;