const express = require('express');
const bcrypt = require('bcrypt');
const {generateToken } = require ('../jwt');
const pool = require('../db');
const router = express.Router();


// Registrera Användare
router.post('/signup', async ( req, res ) =>{
    const {username, password} = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashed]
        );
        const user = result.rows[0];
        res.status(201).json({ token: generateToken(user) });
    } catch (err) {
        res.status(400).json({error : 'Användarnamet är upptaget'});
    }
});

//Logga in
router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    //Tolka inmatning som string och inte kod
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if(!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Fel användarnamn eller lösenord' });
    }

    res.json({ token: generateToken(user) });
});

module.exports = router; 