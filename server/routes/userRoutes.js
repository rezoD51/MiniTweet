const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');

// Korumalı route, tüm user işlemleri için token gerekli
router.use(verifyToken);

router.get('/search', userController.searchUsers); // /api/users/search?q=searchTerm
router.get('/:id', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile); // Kendi profilini güncelleme

router.post('/:id/follow', userController.followUser);
router.post('/:id/unfollow', userController.unfollowUser);

router.get('/:id/followers', userController.getUserFollowers);
router.get('/:id/following', userController.getUserFollowing);


module.exports = router;