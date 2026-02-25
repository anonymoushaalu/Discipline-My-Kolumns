import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';

export default function LogsPage() {
  const { jobId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchLogs(jobId);
    }
  }, [jobId]);

  const fetchLogs = async (jId) => {
    setLoading(true);
    try {
      const response = await apiService.getLogs(jId);
      setLogs(Array.isArray(response) ? response : []);
      setMessage('');
    } catch (error) {
      setMessage(`Error fetching logs: ${error.message}`);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevalidate = async () => {
    if (!window.confirm('Revalidate this job with current system rules? This will reprocess all data with updated rules.')) {
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await apiService.revalidateJob(jobId);
      setMessage(`Revalidation successful! Clean: ${response.clean_rows}, Quarantined: ${response.quarantined_rows}`);
      fetchLogs(jobId);
    } catch (error) {
      setMessage(`Error revalidating: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (color) => {
    const map = {
      'green': '#d4edda',
      'red': '#f8d7da',
      'yellow': '#fff3cd',
      'blue': '#d1ecf1'
    };
    return map[color.toLowerCase()] || '#f5f5f5';
  };

  const getStatusIcon = (color) => {
    const map = {
      'green': 'Pass',
      'red': 'Fail',
      'yellow': 'Warning',
      'blue': 'Info'
    };
    return map[color.toLowerCase()] || '•';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Audit Logs & Validation Details (Job #{jobId})</h2>
        <button
          onClick={handleRevalidate}
          disabled={loading || logs.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: (loading || logs.length === 0) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || logs.length === 0) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            whiteSpace: 'nowrap'
          }}
        >
          {loading ? 'Processing...' : 'Revalidate with Current Rules'}
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da',
            color: message.includes('successful') ? '#155724' : '#721c24',
            borderRadius: '4px',
            border: `1px solid ${message.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading logs...</div>
      ) : logs.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No logs found for this job.</p>
      ) : (
        <>
          <div style={{
            marginBottom: '15px',
            padding: '12px',
            backgroundColor: '#e7f3ff',
            borderRadius: '4px',
            border: '1px solid #b3d9ff'
          }}>
            <strong>Total Log Entries:</strong> {logs.length}
          </div>

          <div style={{
            overflowX: 'auto',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: '4px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '900px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Row #</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Column</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Original Value</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Final Value</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #2c3e50' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Rule Applied</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={log.id}
                    style={{
                      backgroundColor: getStatusColor(log.status_color),
                      borderBottom: '1px solid #ddd'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{log.row_number}</td>
                    <td style={{ padding: '12px' }}>{log.column_name || '—'}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {log.original_value || '—'}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {log.final_value || log.original_value || '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '18px' }}>
                      {getStatusIcon(log.status_color)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#555' }}>
                      {log.rule_applied || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            marginTop: '20px',
            display: 'flex',
            gap: '20px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
          }}>
            <div>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>P</span>
              <strong>Valid:</strong> {logs.filter(l => l.status_color.toLowerCase() === 'green').length}
            </div>
            <div>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>F</span>
              <strong>Invalid:</strong> {logs.filter(l => l.status_color.toLowerCase() === 'red').length}
            </div>
            <div>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>W</span>
              <strong>Warnings:</strong> {logs.filter(l => l.status_color.toLowerCase() === 'yellow').length}
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => fetchLogs(jobId)}
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
        Refresh Logs
      </button>
    </div>
  );
}
