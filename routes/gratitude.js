const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db');

// @route   GET api/gratitude
// @desc    Get all gratitude notes for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM gratitude_notes WHERE user_id = $1 ORDER BY timestamp DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/gratitude
// @desc    Add a gratitude note
router.post('/', auth, async (req, res) => {
    const { note } = req.body;
    if (!note) {
        return res.status(400).json({ msg: 'Note is required' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO gratitude_notes (user_id, note) VALUES ($1, $2) RETURNING *',
            [req.user.id, note]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/gratitude/:id
// @desc    Delete a gratitude note
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM gratitude_notes WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ msg: 'Note deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 