const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const verifyToken = require('../middleware/verifyToken');
const checkTweetOwner = require('../middleware/checkTweetOwner');

// Tüm tweet işlemleri için token gerekli
router.use(verifyToken);

router.post('/', tweetController.createTweet);
router.get('/', tweetController.getFeedTweets); // Anasayfa akışı (kendi ve takip edilenler)
router.get('/user/:userId', tweetController.getUserTweets); // Bir kullanıcının tweetleri
router.get('/:id', tweetController.getTweetById); // Tek bir tweet detayı

router.delete('/:id', checkTweetOwner, tweetController.deleteTweet); // Sadece sahibi silebilir

router.post('/:id/like', tweetController.likeTweet);
router.post('/:id/unlike', tweetController.unlikeTweet);

module.exports = router;