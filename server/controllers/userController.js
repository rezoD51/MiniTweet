const User = require('../models/User');
const Tweet = require('../models/Tweet'); // Tweetleri de getirmek için

// GET /api/users/search?q=searchTerm
exports.searchUsers = async (req, res, next) => {
    const query = req.query.q;
    try {
        if (!query) {
            return res.status(400).json({ message: "Search query 'q' is required." });
        }
        const users = await User.find({
            username: { $regex: query, $options: 'i' } // Case-insensitive search
        }).select('username profilePicture _id'); // Sadece gerekli alanları seç

        res.json(users);
    } catch (error) {
        next(error);
    }
};

// GET /api/users/:id
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password') // Şifreyi gönderme
            .populate('followers', 'username profilePicture _id')
            .populate('following', 'username profilePicture _id');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kullanıcının tweetlerini de getirebiliriz
        const tweets = await Tweet.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture'); // Tweetin yazar bilgisini de al

        res.json({ user, tweets });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/profile (Kendi profilini güncelleme)
exports.updateUserProfile = async (req, res, next) => {
    const { bio, profilePicture } = req.body;
    const userId = req.user._id; // verifyToken'dan gelen kullanıcı ID'si

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (bio !== undefined) user.bio = bio;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        // İleride username, email (doğrulama ile) güncellemesi eklenebilir.

        const updatedUser = await user.save();
        
        // Güncellenmiş kullanıcıyı şifresiz döndür
        const userResponse = { ...updatedUser._doc };
        delete userResponse.password;

        res.json({ message: "Profile updated successfully", user: userResponse });

    } catch (error) {
        next(error);
    }
};


// POST /api/users/:id/follow
exports.followUser = async (req, res, next) => {
    const userToFollowId = req.params.id;
    const currentUserId = req.user._id; // verifyToken'dan gelen kullanıcı

    try {
        if (userToFollowId.toString() === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        const userToFollow = await User.findById(userToFollowId);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Zaten takip ediyor mu kontrolü
        if (currentUser.following.includes(userToFollowId)) {
            return res.status(400).json({ message: "You are already following this user." });
        }

        currentUser.following.push(userToFollowId);
        userToFollow.followers.push(currentUserId);

        await currentUser.save();
        await userToFollow.save();

        // Güncellenmiş current user'ın following listesini döndür
        const updatedCurrentUser = await User.findById(currentUserId)
            .select('following')
            .populate('following', 'username profilePicture _id');

        res.json({ 
            message: `Successfully followed ${userToFollow.username}`,
            following: updatedCurrentUser.following 
        });

    } catch (error) {
        next(error);
    }
};

// POST /api/users/:id/unfollow
exports.unfollowUser = async (req, res, next) => {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.user._id;

    try {
        const userToUnfollow = await User.findById(userToUnfollowId);
        const currentUser = await User.findById(currentUserId);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Takip ediyor mu kontrolü
        if (!currentUser.following.includes(userToUnfollowId)) {
            return res.status(400).json({ message: "You are not following this user." });
        }

        currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollowId.toString());
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId.toString());

        await currentUser.save();
        await userToUnfollow.save();

        const updatedCurrentUser = await User.findById(currentUserId)
            .select('following')
            .populate('following', 'username profilePicture _id');

        res.json({ 
            message: `Successfully unfollowed ${userToUnfollow.username}`,
            following: updatedCurrentUser.following 
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/users/:id/followers
exports.getUserFollowers = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'username profilePicture _id');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.followers);
    } catch (error) {
        next(error);
    }
};

// GET /api/users/:id/following
exports.getUserFollowing = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'username profilePicture _id');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.following);
    } catch (error) {
        next(error);
    }
};