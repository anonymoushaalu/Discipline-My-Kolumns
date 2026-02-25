import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobsDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
    // Refresh every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/jobs');
      setJobs(response.data);
      setError('');
    } catch (err) {
      setError(`Error fetching jobs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading jobs...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>Jobs Dashboard</h2>

      {error && (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <p>No jobs found. Upload a CSV to create one.</p>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Job ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Job Name</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #0056b3' }}>Total Rows</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #0056b3' }}>Clean</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #0056b3' }}>Quarantine</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #0056b3' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => {
              const cleanPercentage = job.total_rows > 0 ? ((job.clean_rows / job.total_rows) * 100).toFixed(1) : 0;
              return (
                <tr key={job.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{job.id}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{job.job_name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{job.total_rows}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', color: '#28a745' }}>
                    {job.clean_rows} ({cleanPercentage}%)
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', color: '#dc3545' }}>
                    {job.quarantined_rows}
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid #ddd',
                    fontWeight: 'bold',
                    color: job.status === 'completed' ? '#28a745' : '#ffc107'
                  }}>
                    {job.status === 'completed' ? 'Completed' : job.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <button
        onClick={fetchJobs}
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
        Refresh
      </button>
    </div>
  );
}
