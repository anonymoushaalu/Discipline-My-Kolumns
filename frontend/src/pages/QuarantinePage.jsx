import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuarantinePage() {
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQuarantine();
    const interval = setInterval(fetchQuarantine, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuarantine = async () => {
    try {
      const response = await axios.get('http://localhost:8000/quarantine');
      setRows(response.data);
      setMessage('');
    } catch (error) {
      setMessage(`Error fetching quarantine: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditValues({ name: row.name, age: row.age });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/update-quarantine/${id}`,
        null,
        {
          params: {
            name: editValues.name,
            age: editValues.age
          }
        }
      );
      setMessage('✅ Row updated successfully');
      setEditingId(null);
      fetchQuarantine();
    } catch (error) {
      setMessage(`❌ Error updating row: ${error.message}`);
    }
  };

  const handleRevalidate = async (id) => {
    try {
      const response = await axios.post(`http://localhost:8000/revalidate/${id}`);
      if (response.data.status === 'success') {
        setMessage(`✅ ${response.data.message}`);
      } else {
        setMessage(`⚠️ Row still invalid: ${response.data.errors?.join(', ')}`);
      }
      fetchQuarantine();
    } catch (error) {
      setMessage(`❌ Error revalidating: ${error.message}`);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading quarantine data...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>⚠️ Quarantine Review & Correction</h2>

      {message && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '4px',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message}
        </div>
      )}

      {rows.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>
          🎉 No quarantined rows! All data is clean.
        </p>
      ) : (
        <>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Found <strong>{rows.length}</strong> quarantined rows. Edit and revalidate them.
          </p>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'auto'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#dc3545', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #c82333' }}>Age</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #c82333' }}>Error Reason</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #c82333' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} style={{ backgroundColor: index % 2 === 0 ? '#fff5f5' : 'white' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{row.id}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {editingId === row.id ? (
                      <input
                        type="text"
                        value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        style={{ padding: '4px', width: '100%' }}
                      />
                    ) : (
                      row.name
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                    {editingId === row.id ? (
                      <input
                        type="number"
                        value={editValues.age}
                        onChange={(e) => setEditValues({ ...editValues, age: parseInt(e.target.value) })}
                        style={{ padding: '4px', width: '70px' }}
                      />
                    ) : (
                      row.age
                    )}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontSize: '12px', color: '#666' }}>
                    {row.error_reason}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                    {editingId === row.id ? (
                      <>
                        <button
                          onClick={() => handleSave(row.id)}
                          style={{
                            padding: '6px 12px',
                            marginRight: '5px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ccc',
                            color: '#333',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✗ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(row)}
                          style={{
                            padding: '6px 12px',
                            marginRight: '5px',
                            backgroundColor: '#ffc107',
                            color: '#333',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => handleRevalidate(row.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🔄 Revalidate
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <button
        onClick={fetchQuarantine}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        🔄 Refresh
      </button>
    </div>
  );
}
