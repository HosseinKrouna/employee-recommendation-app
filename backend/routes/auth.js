const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

  
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

  
    const saltRounds = 10; 
    const passwordHash = await bcrypt.hash(password, saltRounds);

  
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, 'employee'] 
    );

    console.log('New user created:', newUser.rows[0]);
    res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });

  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
   
      return res.status(401).json({ message: 'E-Mail oder Passwort ist ungültig.' });
    }

   
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'E-Mail oder Passwort ist ungültig.' });
    }

    const payload = {
      userId: user.id,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`User ${user.email} logged in successfully.`);
    res.json({ message: 'Login successful', token: token });

  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;