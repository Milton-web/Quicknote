const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Hämta anteckningar - GET
router.get('/', verifyToken, async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM notes WHERE user_id = $1',
        [res.user.id]
    );
    res.json(result.rows);
});

// Skapa anteckning - POST
router.post('/', verifyToken, async (req, res) => {
        const { title, text } = req.body;
        if ( title.lenght > 50 || text.lenght > 300){
            return res.status(400).json({ error: 'Titel eller text är för långt'});
        }

        const id = uuidv4();
        const createdAt = new Date();
        const modifiedAt = createdAt;

        const result = await pool.query(
            'INSERT INTO notes (id, title, text, createdAt, modifiedAt, user_id) VALUES ( $1, text = $2, modifiedAt = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [id, title, modifiedAt, req.params.id, req.user.id]
        );

        res.status(201).json(result.rows[0]);

    });
    

    // Ändra anteckning - PUT
    router.put('/:id', verifyToken, async (req, res) => {
        const { title, text } = req.body;
        const modifiedAt = new Date();

        const result = await pool.query(
            'UPDATE notes SET title = $1, text = $2, modifiedAt = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [title, text, modifiedAt, req.params.id, req.user.id]
        );

        if (result.rowCount === 0) return res.status(400).json({ error: 'Kunde inte hitta anteckningen'});
    });

    // Sök efter anteckningar - GET
    router.get('/search', verifyToken, async (req, res) =>{
        const { title } = req.query;
        const result = await pool.query(
             'SELECT * FROM notes WHERE user_id = $1 AND LOWER(title) LIKE LOWER($2)',
            [req.user.id, `%${title}%`]
        );
        res.json(result.rows);
    });

    module.exports = router;