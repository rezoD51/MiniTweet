require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tweetRoutes = require('./routes/tweetRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.get('/api', (req, res) => res.send('MiniTweet API is Alive!'));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tweets', tweetRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is sizzling on port ${PORT}`));