import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function DataPage() {
  const [cleanData, setCleanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCleanData();
  }, []);

  const fetchCleanData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCleanData(5);
      setCleanData(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(`Error fetching data: ${err.message}`);
      setCleanData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading data...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>Stored Clean Data</h1>

      <div style={{
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '4px',
        marginBottom: '20px',
        border: '1px solid #b3d9ff'
      }}>
        <strong>Info:</strong> This page displays the first 5 rows of clean, validated data stored in the database.
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          Error: {error}
        </div>
      )}

      {cleanData.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
          No clean data available yet. Upload a CSV file to see data here!
        </p>
      ) : (
        <div style={{
          overflowX: 'auto',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '4px'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Row ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Job ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #1e7e34' }}>Age</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #1e7e34' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {cleanData.map((row, index) => (
                <tr
                  key={row.id || index}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                    borderBottom: '1px solid #ddd'
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>#{row.id}</td>
                  <td style={{ padding: '12px' }}>Job #{row.job_id}</td>
                  <td style={{ padding: '12px' }}>{row.name || '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{row.age || '—'}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                    {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderTop: '1px solid #ddd',
            textAlign: 'center'
          }}>
            <strong>Showing first 5 rows of clean data</strong>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
              Total rows shown: {cleanData.length}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={fetchCleanData}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        Refresh Data
      </button>
    </div>
  );
}
