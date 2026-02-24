import React, { useState } from 'react';
import { apiService } from '../services/api';

export default function RulesPage() {
  const [columnName, setColumnName] = useState('');
  const [ruleType, setRuleType] = useState('regex');
  const [ruleValue, setRuleValue] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiService.addRule(columnName, ruleType, ruleValue);

      setMessage('✅ Rule added successfully');
      setColumnName('');
      setRuleType('regex');
      setRuleValue('');
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>Add Validation Rule</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Column Name:</label>
          <input
            type="text"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            placeholder="e.g., name"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Rule Type:</label>
          <select
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          >
            <option value="regex">Regex Pattern</option>
            <option value="range">Range (min-max)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Rule Value:</label>
          <input
            type="text"
            value={ruleValue}
            onChange={(e) => setRuleValue(e.target.value)}
            placeholder={ruleType === 'regex' ? '^[A-Za-z ]+$' : '0-100'}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Adding...' : 'Add Rule'}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '4px',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
