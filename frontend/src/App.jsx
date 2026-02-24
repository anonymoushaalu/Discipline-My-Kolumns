import React, { useState } from 'react';
import axios from 'axios';
import RulesPage from './pages/RulesPage';
import JobsDashboard from './components/JobsDashboard';
import QuarantinePage from './pages/QuarantinePage';
import LogsPage from './pages/LogsPage';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus('Please select a file');
      return;
    }

    setUploadLoading(true);
    setUploadStatus('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadStatus(`✅ Upload successful!\nJob ID: ${response.data.job_id}\nClean: ${response.data.clean_rows} | Quarantine: ${response.data.quarantined_rows}`);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (error) {
      setUploadStatus(`❌ Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="app">
      <nav style={{
        backgroundColor: '#24283b',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: '0 0 15px 0' }}>🧱 Discipline-My-Kolumns</h1>
        <p style={{ margin: '0', fontSize: '14px', opacity: 0.9 }}>Master Data Management System</p>
      </nav>

      <div style={{
        display: 'flex',
        borderBottom: '2px solid #ddd',
        backgroundColor: '#f5f5f5'
      }}>
        <button
          onClick={() => setCurrentTab('upload')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            backgroundColor: currentTab === 'upload' ? '#007bff' : 'transparent',
            color: currentTab === 'upload' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: currentTab === 'upload' ? 'bold' : 'normal'
          }}
        >
          📤 Upload CSV
        </button>
        <button
          onClick={() => setCurrentTab('rules')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            backgroundColor: currentTab === 'rules' ? '#007bff' : 'transparent',
            color: currentTab === 'rules' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: currentTab === 'rules' ? 'bold' : 'normal'
          }}
        >
          ⚙️ Validation Rules
        </button>
        <button
          onClick={() => setCurrentTab('dashboard')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            backgroundColor: currentTab === 'dashboard' ? '#007bff' : 'transparent',
            color: currentTab === 'dashboard' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: currentTab === 'dashboard' ? 'bold' : 'normal'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setCurrentTab('quarantine')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            backgroundColor: currentTab === 'quarantine' ? '#dc3545' : 'transparent',
            color: currentTab === 'quarantine' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: currentTab === 'quarantine' ? 'bold' : 'normal'
          }}
        >
          ⚠️ Quarantine
        </button>
        <button
          onClick={() => setCurrentTab('logs')}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            backgroundColor: currentTab === 'logs' ? '#17a2b8' : 'transparent',
            color: currentTab === 'logs' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: currentTab === 'logs' ? 'bold' : 'normal'
          }}
        >
          📋 Audit Logs
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {currentTab === 'upload' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2>Upload CSV File</h2>
            <form onSubmit={handleUpload}>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
                style={{
                  display: 'block',
                  marginBottom: '15px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={uploadLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: uploadLoading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: uploadLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {uploadLoading ? 'Uploading...' : '🚀 Upload'}
              </button>
            </form>

            {uploadStatus && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: uploadStatus.includes('✅') ? '#d4edda' : '#f8d7da',
                  color: uploadStatus.includes('✅') ? '#155724' : '#721c24',
                  borderRadius: '4px',
                  border: `1px solid ${uploadStatus.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {uploadStatus}
              </div>
            )}
          </div>
        )}

        {currentTab === 'rules' && <RulesPage />}
        {currentTab === 'dashboard' && <JobsDashboard />}
        {currentTab === 'quarantine' && <QuarantinePage />}
        {currentTab === 'logs' && <LogsPage />}
      </div>
    </div>
  );
}
