// routes/savescores.js
const express = require('express');
const router = express.Router();
const pool = require('../db');



// Save quiz scores
router.post('/save-scores', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    // Example: calculating score (optional)
    const score = Object.values(answers).filter(ans => ans === 'correct').length;

    // Save to database (replace with your table/fields)
    await pool.query(
      'INSERT INTO quiz_scores (answers, score, submitted_at) VALUES ($1, $2, NOW())',
      [JSON.stringify(answers), score]
    );

    res.json({ message: 'Score saved successfully' });
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

