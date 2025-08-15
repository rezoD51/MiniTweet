const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, default: 'https://via.placeholder.com/150' }, // Varsayılan bir resim
    bio: { type: String, default: '', maxlength: 160 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' }], // Kullanıcının tweetlerinin ID'leri
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Kullanıcı silindiğinde tweetlerini de silmek için (opsiyonel, ama iyi bir pratik)
// UserSchema.pre('remove', async function(next) { // 'remove' yerine 'deleteOne' veya 'deleteMany' için hook değişebilir.
//   await this.model('Tweet').deleteMany({ user: this._id });
//   next();
// });


module.exports = mongoose.model('User', UserSchema);