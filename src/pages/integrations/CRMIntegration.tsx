import React from 'react';

export default function CRMIntegration() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
        CRM & Marketing Sync
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>
        Two-way synchronization with your existing CRM platforms to enrich your donor data automatically.
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>
        {['Salesforce', 'HubSpot', 'Blackbaud Raiser\'s Edge', 'Microsoft Dynamics'].map(crm => (
          <div key={crm} style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: '#f5f3ff', borderRadius: '10px' }}></div>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{crm}</span>
            </div>
            <button style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              background: '#314ca0',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Connect API
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

