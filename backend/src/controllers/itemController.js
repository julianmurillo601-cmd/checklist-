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

// 2. CREAR (POST) - ERROR INTENCIONAL 1: SQL Injection por concatenación directa
const createItem = async (req, res) => {
  try {
    const { nombre } = req.body;
    // Vulnerable: se concatena req.body.nombre directamente en la consulta SQL
    const query = `INSERT INTO items (nombre) VALUES ('${nombre}') RETURNING *`;
    const result = await pool.query(query);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. ACTUALIZAR (PUT)
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

// 4. ELIMINAR (DELETE) - ERROR INTENCIONAL 2: SQL Injection + XSS en respuesta
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    // Vulnerable: concatenación directa de req.params.id
    const result = await pool.query(`DELETE FROM items WHERE id = ${id} RETURNING *`);
    if (result.rows.length === 0) {
      // Vulnerable: reflejo directo de entrada del usuario en respuesta HTML (XSS)
      return res.status(404).send(`<h1>Producto con ID ${id} no encontrado</h1>`);
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