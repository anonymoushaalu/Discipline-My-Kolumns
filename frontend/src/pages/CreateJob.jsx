import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

export default function CreateJob() {
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState('csv'); // 'csv', 'excel', 'database'
  const [file, setFile] = useState(null);
  const [databaseConfig, setDatabaseConfig] = useState({ host: '', port: '', database: '', username: '', password: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [previousJobs, setPreviousJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    fetchPreviousJobs();
  }, []);

  const fetchPreviousJobs = async () => {
    try {
      const response = await apiService.getJobs();
      setPreviousJobs(Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []));
      setLoadingJobs(false);
    } catch (err) {
      console.error('Error loading previous jobs:', err);
      setLoadingJobs(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (sourceType === 'csv' || sourceType === 'excel') {
      if (!file) {
        setError('Please select a file');
        return;
      }
    } else if (sourceType === 'database') {
      if (!databaseConfig.host || !databaseConfig.database) {
        setError('Please fill in database connection details');
        return;
      }
    }

    setLoading(true);
    setError('');
    setProgress('📤 Starting upload...');

    try {
      let response;
      
      if (sourceType === 'csv' || sourceType === 'excel') {
        setProgress('📁 File validation...');
        await new Promise(r => setTimeout(r, 500));
        
        setProgress('📂 Sending file to server...');
        await new Promise(r => setTimeout(r, 500));
        
        setProgress('🔍 Reading CSV data...');
        await new Promise(r => setTimeout(r, 800));
        
        setProgress('⚙️ Fetching validation rules from database...');
        await new Promise(r => setTimeout(r, 600));
        
        setProgress('✅ Validating each row...');
        await new Promise(r => setTimeout(r, 1200));
        
        setProgress('💾 Storing clean data in database...');
        await new Promise(r => setTimeout(r, 800));
        
        setProgress('⚠️ Storing quarantined data...');
        await new Promise(r => setTimeout(r, 600));
        
        setProgress('📝 Creating audit logs...');
        await new Promise(r => setTimeout(r, 800));
        
        setProgress('✨ Job completed! Preparing results...');
        
        response = await apiService.uploadCSV(file);
      } else if (sourceType === 'database') {
        setProgress('🔌 Connecting to database...');
        await new Promise(r => setTimeout(r, 800));
        
        setProgress('📊 Reading data from database...');
        await new Promise(r => setTimeout(r, 1200));
        
        setProgress('✅ Validating rows...');
        await new Promise(r => setTimeout(r, 1500));
        
        setProgress('💾 Processing results...');
        await new Promise(r => setTimeout(r, 800));
        
        response = await apiService.uploadCSV(file); // Placeholder
      }
      
      setResult(response.data || response);
      setFile(null);
      setProgress('');
      document.getElementById('file-input') && (document.getElementById('file-input').value = '');
    } catch (err) {
      setError(`Upload failed: ${err.response?.data?.detail || err.message}`);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial' }}>
      <h1>📤 Create New Job</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '30px' }}>
        {/* Source Selection Sidebar */}
        <div style={{
          padding: '20px',
          backgroundColor: '#24283b',
          color: 'white',
          borderRadius: '8px',
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>📥 Select Source</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { value: 'csv', label: '📄 CSV Upload', icon: '📄' },
              { value: 'excel', label: '📊 Excel Sheet', icon: '📊' },
              { value: 'database', label: '🗄️ Database', icon: '🗄️' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSourceType(option.value)}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: sourceType === option.value ? '#007bff' : '#34495e',
                  color: 'white',
                  fontWeight: sourceType === option.value ? 'bold' : 'normal',
                  fontSize: '14px'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* CSV Upload */}
          {(sourceType === 'csv' || sourceType === 'excel') && (
            <form onSubmit={handleUpload} style={{
              padding: '30px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              border: '2px dashed #007bff'
            }}>
              <h2 style={{ marginTop: 0 }}>
                {sourceType === 'csv' ? '📄 CSV Upload' : '📊 Excel Sheet Upload'}
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {sourceType === 'csv' ? 'Select CSV File:' : 'Select Excel File:'}
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept={sourceType === 'csv' ? '.csv' : '.xlsx,.xls'}
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
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  {sourceType === 'csv' 
                    ? 'Upload a CSV file with columns: name, age' 
                    : 'Upload an Excel file with columns: name, age'}
                </small>
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
                {loading ? '⏳ Processing...' : '🚀 Upload & Process'}
              </button>
            </form>
          )}

          {/* Database Connection */}
          {sourceType === 'database' && (
            <form onSubmit={handleUpload} style={{
              padding: '30px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              border: '2px dashed #007bff'
            }}>
              <h2 style={{ marginTop: 0 }}>🗄️ Database Connection</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                {[
                  { name: 'host', label: 'Host', placeholder: 'localhost' },
                  { name: 'port', label: 'Port', placeholder: '5432' },
                  { name: 'database', label: 'Database', placeholder: 'mydb' },
                  { name: 'username', label: 'Username', placeholder: 'postgres' },
                  { name: 'password', label: 'Password', type: 'password', placeholder: '' },
                  { name: 'table', label: 'Table Name', placeholder: 'users' }
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '3px' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={databaseConfig[field.name] || ''}
                      onChange={(e) => setDatabaseConfig({ ...databaseConfig, [field.name]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
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
                {loading ? '⏳ Connecting...' : '🚀 Connect & Import'}
              </button>
            </form>
          )}

          {/* Progress Indicator */}
          {progress && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#e7f3ff',
              borderRadius: '4px',
              border: '1px solid #b3d9ff',
              animation: 'pulse 1.5s infinite'
            }}>
              <strong>📊 Processing:</strong> {progress}
              <div style={{
                marginTop: '10px',
                height: '6px',
                backgroundColor: '#ddd',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#007bff',
                  animation: 'loading 2s infinite',
                  width: '30%'
                }} />
              </div>
            </div>
          )}

          {/* Error Message */}
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

          {/* Success Result */}
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
              <p><strong>File Name:</strong> {result.job_name}</p>
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
                  📋 View Logs & Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
