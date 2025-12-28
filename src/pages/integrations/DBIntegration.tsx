import React from 'react';
import './CSVIntegration.css';

export default function DBIntegration() {
  return (
    <div className="csv-integration-container fade-in" style={{ padding: '40px', maxWidth: '1000px', minHeight: 'auto' }}>
      <div className="integration-header">
        <div className="title-area">
          <h1 className="integration-title">Bring Your Own Database (BYOD)</h1>
          <p className="integration-subtitle">Securely connect your SQL databases or Data Warehouse directly to CentroidAI.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '32px' }}>
        {['PostgreSQL', 'Snowflake', 'MySQL', 'MongoDB', 'BigQuery'].map(db => (
          <div key={db} className="blueprint-card" style={{ 
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {db === 'PostgreSQL' ? '🐘' : db === 'Snowflake' ? '❄️' : db === 'MySQL' ? '🐬' : db === 'MongoDB' ? '🍃' : '☁️'}
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>{db}</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>SQL Database</span>
              </div>
            </div>
            <button className="modern-action-btn" style={{ border: 'none' }}>
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

