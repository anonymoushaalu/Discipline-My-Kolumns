import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await apiService.getJobs();
      setJobs(response.data);
      setError('');
    } catch (err) {
      setError(`Error fetching jobs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading jobs...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>📊 Job Dashboard</h1>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>
          No jobs yet. <Link to="/create-job">Create one now</Link>
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: 'white'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Job ID</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>✅ Clean</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>⚠️ Quarantine</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Logs</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => {
                const cleanPercentage = job.total_rows > 0 ? ((job.clean_rows / job.total_rows) * 100).toFixed(1) : 0;
                return (
                  <tr key={job.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>{job.id}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{job.job_name}</td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{job.total_rows}</td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: '#28a745' }}>
                      {job.clean_rows} ({cleanPercentage}%)
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', color: '#dc3545' }}>
                      {job.quarantined_rows}
                    </td>
                    <td style={{
                      padding: '12px',
                      border: '1px solid #ddd',
                      fontWeight: 'bold',
                      color: job.status === 'completed' ? '#28a745' : '#ffc107'
                    }}>
                      {job.status === 'completed' ? '✅ Completed' : '⏳ Processing'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                      <Link
                        to={`/logs/${job.id}`}
                        style={{
                          color: '#007bff',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        📋 View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={fetchJobs}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
