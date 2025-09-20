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
 
    const {
      firstName, lastName, email, phoneNumber, contactSource,
      preferredPosition, employmentStatus, currentPosition, careerLevel,
      yearsOfExperience, noticePeriod, salaryExpectation,
      skills
    } = req.body;
    
    const userId = req.user.userId;

    const insertQuery = `
      INSERT INTO referrals (
        first_name, last_name, email, phone_number, contact_source,
        preferred_position, employment_status, current_position, career_level,
        years_of_experience, notice_period, salary_expectation,
        skills, user_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING *;
    `;

    const values = [
      firstName, lastName, email, phoneNumber, contactSource,
      preferredPosition, employmentStatus, currentPosition, careerLevel,
      yearsOfExperience, noticePeriod, salaryExpectation,
      skills ? JSON.stringify(skills) : null,
      userId
    ];
    
    const newReferral = await pool.query(insertQuery, values);
    
    res.status(201).json(newReferral.rows[0]);

  } catch (err) {
    console.error('Error creating referral:', err.message);
    res.status(500).json({ message: 'Server error while creating referral.' });
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


const PDFDocument = require('pdfkit'); 

router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

   
    const result = await pool.query('SELECT * FROM referrals WHERE id = $1', [id]);
    const referral = result.rows[0];

    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

   
    const doc = new PDFDocument({ margin: 50 });

    const filename = `Empfehlung_${referral.first_name}_${referral.last_name}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('Mitarbeiter werben Mitarbeiter', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(16).text('Persönliche Infos', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${referral.first_name} ${referral.last_name || ''}`);
    doc.text(`E-Mail: ${referral.email || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(16).text('Eckdaten zur Position', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Bevorzugte Position: ${referral.preferred_position || 'N/A'}`);
    doc.text(`Gehaltsvorstellung: ${referral.salary_expectation || 'N/A'}`);
    doc.moveDown();
    
    doc.end();

  } catch (err) {
    console.error('Error generating PDF:', err.message);
    res.status(500).json({ message: 'Server error while generating PDF.' });
  }
});


module.exports = router;