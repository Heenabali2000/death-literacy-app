const express = require('express');
const router = express.Router();
const pool = require('../db'); // Update path if needed

router.post('/save-scores', async (req, res) => {
  try {
    const { answers } = req.body;
    console.log('Received answers:', answers); // Optional logging

    // Save to DB or handle as needed
    // Example: await pool.query('INSERT INTO scores (...) VALUES (...)', [...]);

    res.json({ message: 'Score saved successfully' });
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

module.exports = router;
