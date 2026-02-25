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

    // Check for conflicts with existing rules
    const conflictingRule = rules.find(
      rule => rule.column_name === columnName && rule.rule_type === ruleType
    );

    if (conflictingRule) {
      const conflictMsg = `Rule for column "${columnName}" already exists with ${ruleType} rule: ${conflictingRule.rule_value}. Do you want to replace it?`;
      if (!window.confirm(conflictMsg)) {
        setMessage('Rule addition cancelled');
        setLoading(false);
        return;
      }
    }

    try {
      await apiService.addRule(columnName, ruleType, ruleValue);
      setMessage('Rule added successfully');
      setColumnName('');
      setRuleType('regex');
      setRuleValue('');
      fetchRules();
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.detail || error.message}`);
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
      setMessage('Rule updated successfully');
      setEditingId(null);
      fetchRules();
    } catch (error) {
      setMessage(`Error updating rule: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>Validation Rules Management</h1>

      {/* Add New Rule Section */}
      <div style={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '2px solid #007bff', marginBottom: '30px' }}>
        <h2 style={{ marginTop: 0, color: '#007bff' }}>Add New Rule</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'flex-end' }}>
          <div>
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

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Rule Type:</label>
            <select
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="regex">Regex Pattern</option>
              <option value="range">Range (min-max)</option>
              <option value="length">Length</option>
              <option value="email">Email</option>
              <option value="required">Required</option>
            </select>
          </div>

          <div>
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
              padding: '8px 20px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? 'Adding...' : 'Add Rule'}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
              color: message.includes('successfully') ? '#155724' : '#721c24',
              borderRadius: '4px',
              border: `1px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* Existing Rules Table */}
      <div style={{ padding: '20px', backgroundColor: '#white', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>Preset Rules ({rules.length})</h2>
        
        {loadingRules ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>Loading rules...</p>
        ) : rules.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
            No rules set yet. Add your first rule above!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              border: '1px solid #ddd'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Column Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Rule Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Rule Value</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #2c3e50', width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, idx) => (
                  <tr key={rule.id} style={{
                    backgroundColor: editingId === rule.id ? '#e7f3ff' : (idx % 2 === 0 ? '#fff' : '#f9f9f9'),
                    borderBottom: '1px solid #eee'
                  }}>
                    {editingId === rule.id ? (
                      <>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="text"
                            value={editValues.column_name}
                            onChange={(e) => setEditValues({ ...editValues, column_name: e.target.value })}
                            style={{ width: '100%', padding: '6px', fontSize: '13px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ddd' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={editValues.rule_type}
                            onChange={(e) => setEditValues({ ...editValues, rule_type: e.target.value })}
                            style={{ width: '100%', padding: '6px', fontSize: '13px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ddd' }}
                          >
                            <option value="regex">Regex</option>
                            <option value="range">Range</option>
                            <option value="length">Length</option>
                            <option value="email">Email</option>
                            <option value="required">Required</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="text"
                            value={editValues.rule_value}
                            onChange={(e) => setEditValues({ ...editValues, rule_value: e.target.value })}
                            style={{ width: '100%', padding: '6px', fontSize: '13px', boxSizing: 'border-box', borderRadius: '3px', border: '1px solid #ddd', fontFamily: 'monospace' }}
                          />
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEditSave(rule.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginRight: '5px'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#007bff' }}>{rule.column_name}</td>
                        <td style={{ padding: '12px', color: '#666' }}>
                          {rule.rule_type === 'regex' ? 'Regex Pattern' : 
                           rule.rule_type === 'range' ? 'Range' :
                           rule.rule_type === 'length' ? 'Length' :
                           rule.rule_type === 'email' ? 'Email' :
                           rule.rule_type === 'required' ? 'Required' : rule.rule_type}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#333', fontSize: '12px' }}>
                          {rule.rule_value}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEditStart(rule)}
                            style={{
                              padding: '6px 16px',
                              backgroundColor: '#ffc107',
                              color: '#333',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
