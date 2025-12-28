import React from 'react';

export default function DBIntegration() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
        Bring Your Own Database (BYOD)
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>
        Securely connect your SQL databases or Data Warehouse directly to CentroidAI for real-time intelligence.
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>
        {['PostgreSQL', 'Snowflake', 'MySQL', 'MongoDB', 'BigQuery'].map(db => (
          <div key={db} style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px' }}></div>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{db}</span>
            </div>
            <button style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: '1px solid #314ca0',
              background: 'transparent',
              color: '#314ca0',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

