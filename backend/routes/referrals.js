const express = require('express');
const pool = require('../db')
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');


const router = express.Router(); 

router.use(authenticateToken);


router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM referrals ORDER BY created_at DESC';

    const allReferrals = await pool.query(query);

    res.json(allReferrals.rows);

  } catch (err) {
    console.error('Fehler beim Abrufen der Daten:', err.message);
    res.status(500).json({ message: 'Serverfehler beim Abrufen der Daten.' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { candidateName, candidateSkills } = req.body;
    const userId = req.user.userId; 

    const insertQuery = `
      INSERT INTO referrals (candidate_name, candidate_skills, user_id) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    
   
    const newReferral = await pool.query(insertQuery, [candidateName, candidateSkills, userId]);
    
    res.status(201).json(newReferral.rows[0]);

  } catch (err) {
    console.error('Fehler beim Speichern in der DB:', err.message);
    res.status(500).json({ message: 'Serverfehler beim Speichern der Daten.' });
  }
});


router.patch('/:id', authorizeRole(['hr']), async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const updateQuery = 'UPDATE referrals SET status = $1 WHERE id = $2 RETURNING *';
    const updatedReferral = await pool.query(updateQuery, [status, id]);

    if (updatedReferral.rows.length === 0) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    console.log('Status updated:', updatedReferral.rows[0]);
    res.json(updatedReferral.rows[0]);

  } catch (err) {
    console.error('Error updating status:', err.message);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const referralId = req.params.id;
    const userId = req.user.userId;


    const deleteQuery = `
      DELETE FROM referrals 
      WHERE id = $1 AND user_id = $2 AND status = 'Eingegangen'
      RETURNING *;
    `;
    const result = await pool.query(deleteQuery, [referralId, userId]);

    if (result.rows.length === 0) {
    
      return res.status(403).json({ message: 'Deletion not allowed or referral not found.' });
    }
    
    res.status(200).json({ message: 'Referral successfully withdrawn.' });
  } catch (err) {
    console.error('Error deleting referral:', err.message);
    res.status(500).json({ message: 'Server error while deleting referral.' });
  }
});

module.exports = router;