import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function DataPage() {
  const [cleanData, setCleanData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await apiService.getJobs();
      const jobsList = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      setJobs(jobsList);
      
      // Auto-select latest job if available
      if (jobsList.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsList[0].id);
        fetchCleanData(jobsList[0].id);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setLoading(false);
    }
  };

  const fetchCleanData = async (jobId = null) => {
    setLoading(true);
    try {
      // Fetch clean data
      const dataResponse = await apiService.getCleanData(100, jobId);
      const data = Array.isArray(dataResponse.data) ? dataResponse.data : [];
      setCleanData(data);

      // Extract columns from data
      if (data.length > 0) {
        // Get all unique keys from the data
        const allKeys = new Set();
        data.forEach(row => {
          Object.keys(row).forEach(key => allKeys.add(key));
        });
        
        // Exclude metadata columns and order them
        const excludeColumns = ['id', 'job_id', 'created_at'];
        const displayColumns = Array.from(allKeys)
          .filter(col => !excludeColumns.includes(col))
          .sort();
        
        // Add metadata columns at the end
        const finalColumns = ['id', 'job_id', ...displayColumns, 'created_at'];
        setColumns(finalColumns);
      }

      setError('');
    } catch (err) {
      setError(`Error fetching data: ${err.message}`);
      setCleanData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (jobId) => {
    setSelectedJobId(jobId);
    fetchCleanData(jobId);
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
        <strong>Info:</strong> This page displays clean, validated data. Column headers change based on your uploaded file structure.
      </div>

      {/* Job Selection */}
      {jobs.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
            Select Job to View:
          </label>
          <select
            value={selectedJobId || ''}
            onChange={(e) => handleJobChange(parseInt(e.target.value))}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              width: '100%',
              maxWidth: '400px',
              fontSize: '14px'
            }}
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                Job #{job.id}: {job.job_name} ({job.clean_rows} clean rows)
              </option>
            ))}
          </select>
        </div>
      )}

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
            backgroundColor: 'white',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                {columns.map((column) => (
                  <th
                    key={column}
                    style={{
                      padding: '12px',
                      textAlign: column === 'id' || column === 'job_id' ? 'center' : 'left',
                      borderBottom: '2px solid #1e7e34',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  >
                    {column === 'created_at' ? 'Created At' : column.replace(/_/g, ' ')}
                  </th>
                ))}
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
                  {columns.map((column) => (
                    <td
                      key={`${row.id}-${column}`}
                      style={{
                        padding: '12px',
                        textAlign: column === 'id' || column === 'job_id' ? 'center' : 'left',
                        color: column === 'created_at' ? '#666' : 'inherit',
                        fontSize: column === 'created_at' ? '12px' : '14px'
                      }}
                    >
                      {column === 'created_at'
                        ? row[column]
                          ? new Date(row[column]).toLocaleString()
                          : '—'
                        : row[column] !== undefined && row[column] !== null
                        ? String(row[column])
                        : '—'}
                    </td>
                  ))}
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
            <strong>Showing {cleanData.length} rows</strong>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
              Columns: {columns.filter(c => !['id', 'job_id', 'created_at'].includes(c)).join(', ') || 'name, age'}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => fetchCleanData(selectedJobId)}
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
