require('dotenv').config();
const express = require('express');
const cors = require('cors');
const referralRoutes = require('./routes/referrals');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3001;


const corsOptions = {
  origin: [
    'https://employee-recommendation-app.vercel.app',
    /\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH' ,'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());


app.get('/', (req, res) => {
  res.json({ 
    status: 'Server läuft!', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});


app.use('/api/referrals', referralRoutes);
app.use('/api/auth', authRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Etwas ist schiefgelaufen!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server lauscht auf Port ${port}`);
  console.log(`Health check verfügbar auf: http://localhost:${port}/health`);
});