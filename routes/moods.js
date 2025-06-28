const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db');

// @route   POST api/moods
// @desc    Record or update a user's mood for the current day
router.post('/', auth, async (req, res) => {
    const { mood, notes } = req.body;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to start of UTC day
    const dateStr = today.toISOString().slice(0, 10);

    if (!mood) {
        return res.status(400).json({ msg: 'Mood is required' });
    }

    try {
        // Upsert mood for the day
        const result = await pool.query(
            `INSERT INTO moods (user_id, date, mood, notes) VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, date) DO UPDATE SET mood = $3, notes = $4, timestamp = CURRENT_TIMESTAMP
             RETURNING *`,
            [req.user.id, dateStr, mood, notes || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/moods
// @desc    Get all moods for the authenticated user for a specific month
router.get('/', auth, async (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) {
        return res.status(400).json({ msg: 'Year and month query parameters are required' });
    }
    try {
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = new Date(year, parseInt(month), 0);
        const endDateStr = endDate.toISOString().slice(0, 10);
        const result = await pool.query(
            'SELECT * FROM moods WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC',
            [req.user.id, startDate, endDateStr]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/moods/today
// @desc    Get today's mood for the authenticated user
router.get('/today', auth, async (req, res) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateStr = today.toISOString().slice(0, 10);
    try {
        const result = await pool.query(
            'SELECT * FROM moods WHERE user_id = $1 AND date = $2',
            [req.user.id, dateStr]
        );
        res.json(result.rows[0] || { mood: null, notes: '' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 