const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hallo vom Backend! Der Server läuft.');
});

app.post('/api/referrals', (req, res) => {
  const referralData = req.body;
  console.log('Neue Empfehlung empfangen:');
  console.log(referralData);
  res.status(201).json({ 
    message: 'Empfehlung erfolgreich empfangen!', 
    data: referralData 
  });
});


app.listen(port, () => {
  console.log(`Server lauscht auf http://localhost:${port}`);
});