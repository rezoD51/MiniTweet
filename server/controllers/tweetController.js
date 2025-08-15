const Tweet = require('../models/Tweet');
const User = require('../models/User');

// POST /api/tweets
exports.createTweet = async (req, res, next) => {
    const { content } = req.body;
    const userId = req.user._id; // verifyToken'dan

    try {
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Tweet content cannot be empty." });
        }
        if (content.length > 280) {
            return res.status(400).json({ message: "Tweet content cannot exceed 280 characters." });
        }

        const tweet = new Tweet({
            user: userId,
            content: content.trim()
        });

        const savedTweet = await tweet.save();
        
        // Kullanıcının tweets array'ine de ekle
        await User.findByIdAndUpdate(userId, { $push: { tweets: savedTweet._id } });
        
        // Populate user info for the response
        const populatedTweet = await Tweet.findById(savedTweet._id).populate('user', 'username profilePicture _id');

        res.status(201).json(populatedTweet);
    } catch (error) {
        next(error);
    }
};

// GET /api/tweets (Feed - Kendi ve takip ettiklerinin tweetleri)
exports.getFeedTweets = async (req, res, next) => {
    const currentUserId = req.user._id;
    const currentUser = req.user; // verifyToken'dan gelen tam User objesi

    try {
        // Takip edilen kullanıcıların ID'lerini al
        const followingIds = currentUser.following.map(followedUser => followedUser._id || followedUser); // Eğer populate edilmemişse sadece ID'ler gelir

        // Kendi ID'mizi de dahil et
        const userIdsForFeed = [currentUserId, ...followingIds];

        const tweets = await Tweet.find({ user: { $in: userIdsForFeed } })
            .populate('user', 'username profilePicture _id') // Tweet sahibinin bilgilerini al
            .sort({ createdAt: -1 }) // En yeni tweetler üstte
            .limit(50); // Performans için limit

        res.json(tweets);
    } catch (error) {
        next(error);
    }
};

// GET /api/tweets/user/:userId (Belirli bir kullanıcının tweetleri)
exports.getUserTweets = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const tweets = await Tweet.find({ user: userId })
            .populate('user', 'username profilePicture _id')
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json(tweets);
    } catch (error) {
        next(error);
    }
};

// GET /api/tweets/:id (Tek bir tweet detayı)
exports.getTweetById = async (req, res, next) => {
    try {
        const tweet = await Tweet.findById(req.params.id)
            .populate('user', 'username profilePicture _id')
            .populate('likes', 'username _id'); // Beğenen kullanıcıların bilgilerini de alabiliriz

        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        res.json(tweet);
    } catch (error) {
        next(error);
    }
};


// DELETE /api/tweets/:id
exports.deleteTweet = async (req, res, next) => {
    // checkTweetOwner middleware'i sahiplik kontrolünü zaten yaptı
    const tweetId = req.params.id;
    try {
        // Tweet modelindeki post hook (findOneAndDelete) user'ın tweets array'inden çıkaracak.
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
        if(!deletedTweet){
             return res.status(404).json({ message: "Tweet not found or already deleted." });
        }
        res.json({ message: "Tweet deleted successfully." });
    } catch (error) {
        next(error);
    }
};

// POST /api/tweets/:id/like
exports.likeTweet = async (req, res, next) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    try {
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found." });
        }

        // Zaten beğenilmiş mi kontrolü
        if (tweet.likes.includes(userId)) {
            return res.status(400).json({ message: "You already liked this tweet." });
        }

        tweet.likes.push(userId);
        await tweet.save();
        
        const populatedTweet = await Tweet.findById(tweetId)
            .populate('user', 'username profilePicture _id')
            .populate('likes', 'username _id');

        res.json(populatedTweet);
    } catch (error) {
        next(error);
    }
};

// POST /api/tweets/:id/unlike
exports.unlikeTweet = async (req, res, next) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    try {
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            return res.status(404).json({ message: "Tweet not found." });
        }

        // Beğenilmiş mi kontrolü
        if (!tweet.likes.includes(userId)) {
            return res.status(400).json({ message: "You have not liked this tweet." });
        }

        tweet.likes = tweet.likes.filter(likeId => likeId.toString() !== userId.toString());
        await tweet.save();
        
        const populatedTweet = await Tweet.findById(tweetId)
            .populate('user', 'username profilePicture _id')
            .populate('likes', 'username _id');

        res.json(populatedTweet);
    } catch (error) {
        next(error);
    }
};