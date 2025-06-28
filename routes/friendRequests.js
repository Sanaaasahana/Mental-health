const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db');

// @route   POST api/friend-requests
// @desc    Send a friend request
router.post('/', auth, async (req, res) => {
    const { toUserId } = req.body;
    if (!toUserId) {
        return res.status(400).json({ msg: 'Recipient user ID is required' });
    }
    try {
        // Prevent duplicate requests
        const check = await pool.query(
            'SELECT * FROM friend_requests WHERE from_user_id = $1 AND to_user_id = $2',
            [req.user.id, toUserId]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ msg: 'Friend request already sent' });
        }
        const result = await pool.query(
            'INSERT INTO friend_requests (from_user_id, to_user_id) VALUES ($1, $2) RETURNING *',
            [req.user.id, toUserId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/friend-requests
// @desc    Get all friend requests for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM friend_requests WHERE to_user_id = $1 OR from_user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/friend-requests/:id/accept
// @desc    Accept a friend request
router.post('/:id/accept', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE friend_requests SET status = $1 WHERE id = $2 AND to_user_id = $3 RETURNING *',
            ['accepted', req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Request not found or not authorized' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/friend-requests/:id/reject
// @desc    Reject a friend request
router.post('/:id/reject', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE friend_requests SET status = $1 WHERE id = $2 AND to_user_id = $3 RETURNING *',
            ['rejected', req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Request not found or not authorized' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/friend-requests/check/:userId
// @desc    Check if a friend request exists between users
router.get('/check/:userId', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM friend_requests WHERE (from_user_id = $1 AND to_user_id = $2) OR (from_user_id = $2 AND to_user_id = $1)',
            [req.user.id, req.params.userId]
        );
        res.json(result.rows[0] || { exists: false });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 