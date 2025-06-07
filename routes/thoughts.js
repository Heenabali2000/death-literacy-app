// routes/thoughts.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Save user's thought
router.post('/submit-thought', async (req, res) => {
  const { thought } = req.body;
  const userId = req.session.userId || null;

  if (!thought || thought.trim() === "") {
    return res.status(400).json({ error: "Empty thought" });
  }

  try {
    await pool.query(
      'INSERT INTO thoughts (user_id, thought) VALUES ($1, $2)',
      [userId, thought]
    );
    res.status(200).json({ message: 'Thought saved' });
  } catch (err) {
    console.error("Error saving thought:", err);
    res.status(500).json({ error: 'Failed to save thought' });
  }
});

module.exports = router;
