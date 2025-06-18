const express = require('express');
const bcrypt = require('bcrypt');
const { generateToken } = require('../jwt');
const pool = require('../db');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Användarhantering
 */

/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     summary: Registrera en ny användare
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               password:
 *                 type: string
 *                 example: test123
 *     responses:
 *       201:
 *         description: Användare skapad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Användarnamnet är upptaget
 *       500:
 *         description: Serverfel
 */

// Registrera användare - POST
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

      //kontrollera om användaren finns, förhindrar dubletter
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

  
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Användarnamnet är upptaget' });
    }

    //skapar användaren i databasen och skickar ut JWT
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashed]
    );

    const user = result.rows[0];

    //Ger användaren JWT-token 
    res.status(201).json({ token: generateToken(user) });

  } catch (err) {
    console.error('Fel i /signup:', err);
    res.status(500).json({
      error: 'Serverfel',
      details: err.message,
    });
  }
});

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Logga in
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               password:
 *                 type: string
 *                 example: test123
 *     responses:
 *       200:
 *         description: Inloggning lyckades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Fel användarnamn eller lösenord
 */

//Logga in - POST
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  //Hämtar användaren och kommar så att lösenordet stämmer
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Fel användarnamn eller lösenord' });
  }

  //Ger användaren JWT token 
  res.json({ token: generateToken(user) });
});

module.exports = router;
