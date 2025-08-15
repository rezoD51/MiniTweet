const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 280, trim: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // retweet: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // İleride eklenebilir
    // replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' }], // İleride eklenebilir
    createdAt: { type: Date, default: Date.now }
});

// Tweet silindiğinde, bu tweet'i atan kullanıcının tweets array'inden de kaldır.
TweetSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(doc.user, { $pull: { tweets: doc._id } });
    }
});


module.exports = mongoose.model('Tweet', TweetSchema);