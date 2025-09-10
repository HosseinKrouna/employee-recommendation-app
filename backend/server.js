
const express = require('express');

const app = express();

const port = 3001;

app.get('/', (req, res) => {
  res.send('Hallo vom Backend! Der Server läuft.');
});

app.listen(port, () => {
  console.log(`Server lauscht auf http://localhost:${port}`);
});