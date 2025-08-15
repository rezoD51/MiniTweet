const Tweet = require('../models/Tweet');

const checkTweetOwner = async (req, res, next) => {
    try {
        const tweetId = req.params.id || req.params.tweetId; // Farklı route parametreleri için
        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            return res.status(404).json({ message: 'Tweet not found' });
        }

        // req.user, verifyToken middleware'inden geliyor (Mongoose User objesi)
        if (tweet.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You are not the owner of this tweet' });
        }
        req.tweet = tweet; // Tweet objesini sonraki handler'a aktar (opsiyonel)
        next();
    } catch (error) {
        console.error('CheckTweetOwner Error:', error);
        if (error.kind === 'ObjectId') { // Geçersiz ID formatı
            return res.status(400).json({ message: 'Invalid tweet ID format' });
        }
        res.status(500).json({ message: 'Server error while checking tweet ownership' });
    }
};
module.exports = checkTweetOwner;