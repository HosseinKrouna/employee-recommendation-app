require('dotenv').config();
const express = require('express');
const cors = require('cors');
const referralRoutes = require('./routes/referrals');
const authRoutes = require('./routes/auth');

const app = express();

const port = process.env.PORT || 3001;

const corsOptions = {
  origin: 'employee-recommendation-app.vercel.app'
};

app.use(cors(corsOptions));app.use(express.json());

app.use('/api/referrals', referralRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server lauscht auf Port ${port}`);
});