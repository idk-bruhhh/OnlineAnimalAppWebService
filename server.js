const express = require('express');
const mysql = require('mysql2/promise')
require('dotenv').config()
const port = 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
}

const app = express();
app.use(express.json());

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
});

app.get('/animals', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM animals');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error for animals'});
    }
});

app.post('/addAnimals', async (req, res) => {
    const { animal_name, animal_pic } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO animals (animal_name, animal_pic) VALUES (?, ?)',
            [animal_name, animal_pic]
        );
        res.status(201).json({ message: 'Animal ' + animal_name + ' added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add animal ' + animal_name });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/updateAnimals', async (req, res) => {
    const { id } = req.params;
    const { animal_name, animal_pic } = req.body;
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

// --- DELETE an animal ---
app.delete('/deleteAnimals', async (req, res) => {
    const { id } = req.params;
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
