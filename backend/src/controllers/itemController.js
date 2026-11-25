const pool = require('../config/db');

// 1. MOSTRAR (GET)
const getItems = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. CREAR (POST)
const createItem = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
    }
    const result = await pool.query(
      'INSERT INTO items (nombre) VALUES ($1) RETURNING *',
      [nombre.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. ACTUALIZAR (PUT) - Cambia el estado de comprado (true/false)
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { comprado } = req.body;
    const result = await pool.query(
      'UPDATE items SET comprado = $1 WHERE id = $2 RETURNING *',
      [comprado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. ELIMINAR (DELETE)
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado', item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
};