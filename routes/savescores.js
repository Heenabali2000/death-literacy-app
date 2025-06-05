// routes/saveScores.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // adjust path if needed

router.post('/save-scores', async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers) {
      return res.status(400).json({ error: 'Missing quiz answers' });
    }

    const result = await pool.query(
      'INSERT INTO scores (answers) VALUES ($1) RETURNING *',
      [answers]
    );

    res.status(200).json({ message: 'Score saved successfully', result: result.rows[0] });
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

module.exports = router;

module.exports = router;
