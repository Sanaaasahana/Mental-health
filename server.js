const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/moods', require('./routes/moods'));
app.use('/api/gratitude', require('./routes/gratitude'));
app.use('/api/friend-requests', require('./routes/friendRequests'));

// Serve the main HTML files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

app.get('/journal', (req, res) => {
    res.sendFile(__dirname + '/journal.html');
});

app.get('/support', (req, res) => {
    res.sendFile(__dirname + '/support.html');
});

app.get('/connect', (req, res) => {
    res.sendFile(__dirname + '/connect.html');
});

app.get('/profile', (req, res) => {
    res.sendFile(__dirname + '/profile.html');
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindful-wellness';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 