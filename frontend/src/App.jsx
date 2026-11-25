import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api/items';

function App() {
  const [items, setItems] = useState([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      try {
        setError('');
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('No se pudo cargar la lista de compras');
        }
        const data = await response.json();
        if (active) {
          setItems(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      active = false;
    };
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) return;

    try {
      setError('');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al agregar el producto');
      }

      setItems((prev) => [...prev, data]);
      setNombre('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleItem = async (item) => {
    try {
      setError('');
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comprado: !item.comprado }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el producto');
      }

      setItems((prev) =>
        prev.map((current) => (current.id === item.id ? data : current))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      setError('');
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el producto');
      }

      setItems((prev) => prev.filter((current) => current.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const totalCount = items.length;
  const boughtCount = items.filter((item) => item.comprado).length;

  return (
    <main className="container">
      <header className="header">
        <h1>Lista del Súper</h1>
        <p className="counter">
          {boughtCount} de {totalCount} comprados
        </p>
      </header>

      <form className="form-add" onSubmit={handleAddItem}>
        <input
          type="text"
          placeholder="Agregar producto (ej. Leche, Pan...)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button type="submit">Agregar</button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="status-msg">Cargando lista...</p>
      ) : items.length === 0 ? (
        <p className="status-msg">Tu checklist está vacía. Agrega un producto.</p>
      ) : (
        <ul className="checklist">
          {items.map((item) => (
            <li key={item.id} className="checklist-item">
              <label className="item-label">
                <input
                  type="checkbox"
                  checked={Boolean(item.comprado)}
                  onChange={() => handleToggleItem(item)}
                />
                <span className={item.comprado ? 'comprado' : ''}>
                  {item.nombre}
                </span>
              </label>
              <button
                type="button"
                className="btn-delete"
                onClick={() => handleDeleteItem(item.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;