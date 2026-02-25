import React, { useState } from 'react';

export default function HeaderConfigModal({ previewData, onConfirm, onCancel, fileName }) {
  const [columnRules, setColumnRules] = useState({});
  const [columnNames, setColumnNames] = useState({});

  const handleRuleChange = (columnName, field, value) => {
    setColumnRules(prev => ({
      ...prev,
      [columnName]: {
        ...(prev[columnName] || {}),
        [field]: value
      }
    }));
  };

  const handleColumnNameChange = (originalName, newName) => {
    setColumnNames(prev => ({
      ...prev,
      [originalName]: newName
    }));
  };

  const handleDeleteRule = (columnName) => {
    const newRules = { ...columnRules };
    delete newRules[columnName];
    setColumnRules(newRules);
  };

  const handleReset = (columnName) => {
    const newRules = { ...columnRules };
    delete newRules[columnName];
    setColumnRules(newRules);
  };

  const handleConfirm = () => {
    onConfirm({ rules: columnRules, columnNames });
  };

  if (!previewData) return null;

  const { columns, sample_rows, file_name } = previewData;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxHeight: '90vh',
        overflowY: 'auto',
        maxWidth: '1200px',
        width: '95%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <h2>Configure Headers - {file_name}</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Review detected column types and configure validation rules for this upload only.
        </p>

        {/* Header Configuration Table */}
        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            border: '1px solid #ddd'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Column Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Detected Type</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Preset Rule</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Edit Rule Type</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #2c3e50' }}>Edit Rule Value</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #2c3e50' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col, idx) => {
                const customRule = columnRules[col.name];
                const hasCustom = customRule && customRule.type;
                const displayName = columnNames[col.name] || col.name;
                const hasPresetRule = col.system_rule && col.system_rule.type;
                
                return (
                  <tr key={idx} style={{
                    backgroundColor: hasCustom ? '#fff3cd' : (idx % 2 === 0 ? '#fff' : '#f9f9f9'),
                    borderBottom: '1px solid #eee'
                  }}>
                    <td style={{ padding: '12px' }}>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => handleColumnNameChange(col.name, e.target.value)}
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                        placeholder={col.name}
                      />
                    </td>
                    <td style={{ padding: '12px', color: '#0066cc', fontSize: '13px' }}>{col.detected_type}</td>
                    <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'monospace' }}>
                      {hasPresetRule ? (
                        <div style={{ backgroundColor: '#e7f3ff', padding: '6px', borderRadius: '3px', border: '1px solid #b3d9ff' }}>
                          <div><strong>{col.system_rule.type}</strong></div>
                          <div style={{ fontSize: '11px', color: '#666' }}>{col.system_rule.value}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '11px' }}>No preset rule</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: hasCustom ? '#ffc107' : (hasPresetRule ? '#28a745' : '#6c757d'),
                        color: 'white'
                      }}>
                        {hasCustom ? 'OVERRIDE' : (hasPresetRule ? 'SET' : 'UNSET')}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={customRule?.type || ''}
                        onChange={(e) => handleRuleChange(col.name, 'type', e.target.value)}
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontFamily: 'Arial',
                          width: '100%'
                        }}
                      >
                        <option value="">-- No override --</option>
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
                        value={customRule?.value || ''}
                        onChange={(e) => handleRuleChange(col.name, 'value', e.target.value)}
                        placeholder="e.g., ^[A-Z]+$ or 0-100"
                        style={{
                          padding: '6px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {hasCustom && (
                        <>
                          <button
                            onClick={() => handleDeleteRule(col.name)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              marginRight: '4px',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleReset(col.name)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Reset
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sample Data Preview */}
        {sample_rows.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px', border: '1px solid #b3d9ff' }}>
            <h4 style={{ marginTop: 0 }}>Sample Data Preview (First {sample_rows.length} rows)</h4>
            <div style={{ overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
              <table style={{
                fontSize: '12px',
                borderCollapse: 'collapse',
                backgroundColor: '#f9f9f9',
                border: '1px solid #ddd',
                width: '100%'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#d1ecf1', borderBottom: '1px solid #bce8f1' }}>
                    {columns.map(col => (
                      <th key={col.name} style={{ padding: '8px', textAlign: 'left' }}>
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sample_rows.map((row, rowIdx) => (
                    <tr key={rowIdx} style={{ borderBottom: '1px solid #ddd' }}>
                      {columns.map(col => (
                        <td key={col.name} style={{ padding: '8px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {String(row[col.name] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          borderTop: '1px solid #ddd',
          paddingTop: '20px'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Confirm & Process
          </button>
        </div>

        <p style={{ marginTop: '15px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
          Note: Custom rules will apply only to this upload. They won't be saved to the system rules.
        </p>
      </div>
    </div>
  );
}
