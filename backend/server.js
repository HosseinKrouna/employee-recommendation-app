const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hallo vom Backend! Der Server läuft.');
});


app.post('/api/referrals', async (req, res) => {
  try {
    
    const { candidateName, candidateSkills } = req.body;

    const insertQuery = `
      INSERT INTO referrals (candidate_name, candidate_skills) 
      VALUES ($1, $2) 
      RETURNING *;
    `;

    const newReferral = await pool.query(insertQuery, [candidateName, candidateSkills]);

    console.log('Neue Empfehlung in DB gespeichert:', newReferral.rows[0]);

   
    res.status(201).json({ 
      message: 'Empfehlung erfolgreich in der Datenbank gespeichert!', 
      data: newReferral.rows[0] 
    });

  } catch (err) {
    console.error('Fehler beim Speichern in der DB:', err.message);
    res.status(500).json({ message: 'Serverfehler beim Speichern der Daten.' });
  }
});

app.listen(port, () => {
  console.log(`Server lauscht auf http://localhost:${port}`);
});