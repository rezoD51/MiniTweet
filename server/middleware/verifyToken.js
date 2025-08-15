const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User modelini de dahil edelim

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided or malformed token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Token'dan gelen kullanıcı ID'si ile veritabanından kullanıcıyı bulup req.user'a atayalım.
        // Bu, kullanıcının varlığını ve güncel bilgilerini garanti eder.
        const user = await User.findById(decoded.user.id).select('-password'); // Şifreyi hariç tut
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        req.user = user; // Artık req.user tam bir Mongoose User dökümanı (şifresiz)
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};

module.exports = verifyToken;