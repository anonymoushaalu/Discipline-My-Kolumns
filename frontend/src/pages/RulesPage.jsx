import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function RulesPage() {
  const [columnName, setColumnName] = useState('');
  const [ruleType, setRuleType] = useState('regex');
  const [ruleValue, setRuleValue] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoadingRules(true);
    try {
      const response = await apiService.getRules();
      setRules(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoadingRules(false);
    }
  };

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
      fetchRules();
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (rule) => {
    setEditingId(rule.id);
    setEditValues({ 
      column_name: rule.column_name,
      rule_type: rule.rule_type,
      rule_value: rule.rule_value
    });
  };

  const handleEditSave = async (id) => {
    try {
      await apiService.updateRule(id, editValues.column_name, editValues.rule_type, editValues.rule_value);
      setMessage('✅ Rule updated successfully');
      setEditingId(null);
      fetchRules();
    } catch (error) {
      setMessage(`❌ Error updating rule: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>⚙️ Validation Rules Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Add New Rule Section */}
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2 style={{ marginTop: 0 }}>➕ Add New Rule</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Column Name:</label>
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="e.g., name, email, age"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Rule Type:</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="regex">Regex Pattern</option>
                <option value="range">Range (min-max)</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Rule Value:</label>
              <input
                type="text"
                value={ruleValue}
                onChange={(e) => setRuleValue(e.target.value)}
                placeholder={ruleType === 'regex' ? '^[A-Za-z ]+$' : '0-100'}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {loading ? '⏳ Adding...' : '➕ Add Rule'}
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

        {/* Existing Rules Section */}
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h2 style={{ marginTop: 0 }}>📋 Existing Rules ({rules.length})</h2>
          
          {loadingRules ? (
            <p style={{ textAlign: 'center', color: '#666' }}>Loading rules...</p>
          ) : rules.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
              📭 No rules set yet. Add your first rule on the left!
            </p>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: editingId === rule.id ? '#e7f3ff' : 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  {editingId === rule.id ? (
                    <>
                      <input
                        type="text"
                        value={editValues.column_name}
                        onChange={(e) => setEditValues({ ...editValues, column_name: e.target.value })}
                        style={{ width: '100%', padding: '4px', fontSize: '12px', marginBottom: '5px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ddd' }}
                      />
                      <select
                        value={editValues.rule_type}
                        onChange={(e) => setEditValues({ ...editValues, rule_type: e.target.value })}
                        style={{ width: '100%', padding: '4px', fontSize: '12px', marginBottom: '5px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ddd' }}
                      >
                        <option value="regex">Regex</option>
                        <option value="range">Range</option>
                      </select>
                      <input
                        type="text"
                        value={editValues.rule_value}
                        onChange={(e) => setEditValues({ ...editValues, rule_value: e.target.value })}
                        style={{ width: '100%', padding: '4px', fontSize: '12px', marginBottom: '5px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ddd' }}
                      />
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleEditSave(rule.id)}
                          style={{
                            flex: 1,
                            padding: '4px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            flex: 1,
                            padding: '4px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          ✗ Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div><strong style={{ color: '#007bff' }}>📊 {rule.column_name}</strong></div>
                      <div style={{ fontSize: '11px', color: '#666', margin: '3px 0' }}>
                        {rule.rule_type === 'regex' ? '🔤 Pattern' : '📈 Range'}: <code style={{ backgroundColor: '#f5f5f5', padding: '1px 4px' }}>{rule.rule_value}</code>
                      </div>
                      <button
                        onClick={() => handleEditStart(rule)}
                        style={{
                          width: '100%',
                          padding: '4px',
                          backgroundColor: '#ffc107',
                          color: '#333',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          marginTop: '5px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✎ Edit
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
