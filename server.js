const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const port = 3000;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const app = express();
app.use(express.json());

// --- START SERVER ---
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// --- GET: Get all animals ---
app.get('/getAllAnimals', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM animals');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not fetch animals' });
    } finally {
        if (connection) await connection.end();
    }
});

// --- POST: Add an animal ---
app.post('/addAnimal', async (req, res) => {
    const { animal_name, animal_pic } = req.body;
    if (!animal_name || !animal_pic) {
        return res.status(400).json({ message: 'animal_name and animal_pic are required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO animals (animal_name, animal_pic) VALUES (?, ?)',
            [animal_name, animal_pic]
        );
        res.status(201).json({ message: `Animal ${animal_name} added successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error - could not add animal ${animal_name}` });
    } finally {
        if (connection) await connection.end();
    }
});

// --- POST: Update an animal ---
app.post('/updateAnimal', async (req, res) => {
    const { id, animal_name, animal_pic } = req.body;
    if (!id || !animal_name || !animal_pic) {
        return res.status(400).json({ message: 'ID, animal_name, and animal_pic are required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE animals SET animal_name = ?, animal_pic = ? WHERE id = ?',
            [animal_name, animal_pic, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Animal not found' });
        }

        res.json({ message: 'Animal updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update animal' });
    } finally {
        if (connection) await connection.end();
    }
});

// --- POST: Delete an animal ---
app.post('/deleteAnimal', async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'DELETE FROM animals WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Animal not found' });
        }

        res.json({ message: 'Animal deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete animal' });
    } finally {
        if (connection) await connection.end();
    }
});
