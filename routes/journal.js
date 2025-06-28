const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db');

// @route   GET api/journal
// @desc    Get all journal entries for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY timestamp DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST api/journal
// @desc    Create a new journal entry
router.post('/', auth, async (req, res) => {
    const { content, category, isPublic } = req.body;
    if (!content) {
        return res.status(400).json({ msg: 'Content is required' });
    }
    try {
        // Get user name
        const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const userName = userResult.rows[0]?.name || '';
        const result = await pool.query(
            'INSERT INTO journal_entries (user_id, user_name, content, category, is_public) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, userName, content, category || 'other', isPublic || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET api/journal/public
// @desc    Get all public journal entries
router.get('/public', async (req, res) => {
    try {
        const entries = await pool.query('SELECT * FROM journal_entries WHERE is_public = true ORDER BY timestamp DESC');
        res.json(entries.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   DELETE api/journal/:id
// @desc    Delete a journal entry
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM journal_entries WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ msg: 'Entry deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT api/journal/:id
// @desc    Update a journal entry's public/private status
router.put('/:id', auth, async (req, res) => {
    const { isPublic } = req.body;
    try {
        const result = await pool.query(
            'UPDATE journal_entries SET is_public = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [isPublic, req.params.id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Entry not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router; 
