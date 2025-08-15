const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    console.log("Register isteği alındı:", req.body);
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            const field = user.email === email ? 'Email' : 'Username';
            console.log(`Kullanıcı zaten var (${field}):`, username, email);
            return res.status(400).json({ message: `${field} already exists.` });
        }

        console.log("Yeni kullanıcı oluşturuluyor...");
        user = new User({ username, email, password });

        
        await user.save();

        const savedUser = await user.save(); // KAYIT İŞLEMİ
        console.log("Kullanıcı başarıyla kaydedildi, ID:", savedUser._id);

        const payload = { user: { id: user.id, username: user.username } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); // Token süresini uzattım

        res.status(201).json({
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                followers: user.followers,
                following: user.following,
                profilePicture: user.profilePicture,
                bio: user.bio,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("registerUser içinde CATCH bloğuna düşüldü, HATA:", error);
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    const { emailOrUsername, password } = req.body;
    try {
        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: "Email/Username and password are required." });
        }
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        }).populate('followers', 'username profilePicture')
          .populate('following', 'username profilePicture');


        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. User not found.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
        }

        const payload = { user: { id: user.id, username: user.username } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                followers: user.followers,
                following: user.following,
                profilePicture: user.profilePicture,
                bio: user.bio,
                createdAt: user.createdAt
             }
        });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    // verifyToken middleware'i req.user'ı zaten doldurmuş olmalı
    try {
        // req.user Mongoose dökümanı olduğu için ._id kullanabiliriz veya doğrudan gönderebiliriz
        // Şifre zaten verifyToken'da seçilmedi
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('followers', 'username profilePicture _id')
            .populate('following', 'username profilePicture _id');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            createdAt: user.createdAt
        });
    } catch (error) {
        next(error);
    }
};