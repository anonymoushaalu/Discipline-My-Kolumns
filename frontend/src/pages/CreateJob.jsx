import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function CreateJob() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.uploadCSV(file);
      setResult(response.data);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(`Upload failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>📤 Create New Job (Upload CSV)</h1>

      <form onSubmit={handleUpload} style={{
        padding: '30px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '2px dashed #007bff'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            Select CSV File:
          </label>
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
            style={{
              display: 'block',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Uploading...' : '🚀 Upload CSV'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          border: '1px solid #c3e6cb'
        }}>
          <h2 style={{ marginTop: 0 }}>✅ Job Created Successfully!</h2>
          <p><strong>Job ID:</strong> {result.job_id}</p>
          <p><strong>Total Rows:</strong> {result.total_rows}</p>
          <p style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Clean Rows: {result.clean_rows}</p>
          <p style={{ color: '#dc3545', fontWeight: 'bold' }}>⚠️ Quarantined Rows: {result.quarantined_rows}</p>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📊 Go to Dashboard
            </button>
            <button
              onClick={() => navigate(`/logs/${result.job_id}`)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📋 View Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
