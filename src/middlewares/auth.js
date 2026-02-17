const User = require("../models/User.model.js");
const { verifyToken } = require("../utils/jwt.js");

const isAuth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const token = authorization.replace("Bearer ", "");
        const decoded = verifyToken(token); 
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next(); 

    } catch (error) {
        return res.status(401).json({ message: "Invalid token", error:error.message });
    }
};

const isAdmin = async (req, res, next) => {
    if (req.user.role === "admin") {
        next();
    } else {
return res.status(403).json({ message: "Forbidden: Admins only" });
    }

};

module.exports = { isAuth, isAdmin };