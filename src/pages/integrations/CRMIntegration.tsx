import React from 'react';
import './CSVIntegration.css';

export default function CRMIntegration() {
  return (
    <div className="csv-integration-container fade-in" style={{ padding: '40px', maxWidth: '1000px', minHeight: 'auto' }}>
      <div className="integration-header">
        <div className="title-area">
          <h1 className="integration-title">CRM & Marketing Sync</h1>
          <p className="integration-subtitle">Two-way synchronization with your existing CRM platforms to enrich donor data.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '32px' }}>
        {['Salesforce', 'HubSpot', 'Blackbaud Raiser\'s Edge', 'Microsoft Dynamics'].map(crm => (
          <div key={crm} className="blueprint-card" style={{ 
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
                justifyContent: 'space-between',
                padding: '0 10px'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {crm === 'Salesforce' ? '☁️' : crm === 'HubSpot' ? '🟠' : crm === 'Blackbaud Raiser\'s Edge' ? '🦅' : '🏢'}
                </div>
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>{crm}</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Cloud CRM</span>
              </div>
            </div>
            <button className="primary-sync-btn" style={{ 
              padding: '10px 20px', 
              fontSize: '12px',
              minWidth: 'auto',
              border: 'none'
            }}>
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

