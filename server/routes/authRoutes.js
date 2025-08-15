const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/me', verifyToken, authController.getMe); // Token ile kullanıcı bilgisini doğrulamak için

module.exports = router;