const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Hantering av anteckningar
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Hämta alla anteckningar för en inloggad användare
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista av anteckningar
 */

//Hämta anteckningar på användaren - GET
router.get('/', verifyToken, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM notes WHERE user_id = $1',
    [req.user.id]
  );
  res.json(result.rows);
});

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Skapa en ny anteckning
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - text
 *             properties:
 *               title:
 *                 type: string
 *                 example: Min anteckning
 *               text:
 *                 type: string
 *                 example: Det här är innehållet i anteckningen
 *     responses:
 *       201:
 *         description: Anteckningen skapades
 *       400:
 *         description: Titel eller text är för lång
 */

//Skapa en anteckning - POST
router.post('/', verifyToken, async (req, res) => {
  const { title, text } = req.body;
  if (title.length > 50 || text.length > 300) {
    return res.status(400).json({ error: 'Titel eller text är för långt' });
  }

  const id = uuidv4();
  const createdAt = new Date();
  const modifiedAt = createdAt;

  //Ser till att ingen kan ta bort någon annans anteckningar
  const result = await pool.query(
    `INSERT INTO notes (id, title, text, createdAt, modifiedAt, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, title, text, createdAt, modifiedAt, req.user.id]
  );

  res.status(201).json(result.rows[0]);
});

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Uppdatera en anteckning
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID för anteckningen
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - text
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Anteckningen uppdaterad
 *       404:
 *         description: Kunde inte hitta anteckningen
 */

//Ändra anteckning - PUT
router.put('/:id', verifyToken, async (req, res) => {
  const { title, text } = req.body;
  const modifiedAt = new Date();

  try {
    //Visar redigerade anteckning och så man inte ändrar någon annans anteckning
    const result = await pool.query(
      'UPDATE notes SET title = $1, text = $2, modifiedAt = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, text, modifiedAt, req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Kunde inte hitta anteckningen' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfel vid uppdatering' });
  }
});

/**
 * @swagger
 * /api/notes/search?titel=:
 *   get:
 *     summary: Sök efter anteckningar via titel
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: title
 *         in: query
 *         description: Sökord för titel
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matchande anteckningar returnerade
 */

//Sök efter anteckning - GET(search?title=)
router.get('/search', verifyToken, async (req, res) => {
  const { title } = req.query;

  //Gör sökning case-insensitive, ger bara ut inloggad användarens anteckningar
  const result = await pool.query(
    'SELECT * FROM notes WHERE user_id = $1 AND LOWER(title) LIKE LOWER($2)',
    [req.user.id, `%${title}%`]
  );
  res.json(result.rows);
});

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Ta bort en anteckning
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID för anteckningen som ska tas bort
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Anteckningen har tagits bort
 *       404:
 *         description: Anteckningen kunde inte hittas
 */

//Ta bort anteckning - DELETE
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Anteckningen kunde inte hittas eller har tagits bort' });
    }

    res.json({ message: 'Anteckningen har tagits bort', deletedNote: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Serverfel vid borttagning av anteckning' });
  }
});

module.exports = router;
