require('dotenv').config();
const express = require('express');
const cors = require('cors');
const referralRoutes = require('./routes/referrals');

const app = express();
const port = 3001;


app.use(cors());
app.use(express.json());

app.use('/api/referrals', referralRoutes);

app.listen(port, () => {
  console.log(`Server lauscht auf http://localhost:${port}`);
});