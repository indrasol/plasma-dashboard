import React, { useEffect, useState } from 'react';
import './CSVIntegration.css';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

export default function DBIntegration() {
  const [tables, setTables] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.dbTables);
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setMessage(null);
      const res = await fetch(API_ENDPOINTS.dbSync, { method: 'POST' });
      if (res.ok) {
        setMessage({ text: "Full database sync completed successfully.", type: 'success' });
      } else {
        throw new Error("Sync failed");
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async (tableName: string) => {
    try {
      setExporting(tableName);
      setMessage(null);
      const res = await fetch(API_ENDPOINTS.dbExport(tableName), { method: 'POST' });
      if (res.ok) {
        setMessage({ text: `Table ${tableName} exported to local CSV successfully.`, type: 'success' });
      } else {
        throw new Error(`Export of ${tableName} failed`);
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="csv-integration-container fade-in" style={{ padding: '40px', maxWidth: '1000px', minHeight: 'auto' }}>
      <div className="integration-header">
        <div className="title-area">
          <h1 className="integration-title">Bring Your Own Database (BYOD)</h1>
          <p className="integration-subtitle">Manage internal tables and sync data from Supabase to CentroidAI's Neural Engine.</p>
        </div>
        <button 
          className="modern-primary-btn" 
          onClick={handleSync}
          disabled={syncing}
          style={{ background: 'linear-gradient(135deg, #314ca0, #2a4085)', color: 'white' }}
        >
          {syncing ? 'Syncing...' : '🔄 Sync All Tables'}
        </button>
      </div>

      {message && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: '12px',
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          fontSize: '14px',
          fontWeight: 500
        }}>
          {message.text}
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Managed Core Tables</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {tables.map(table => (
            <div key={table} className="blueprint-card" style={{ 
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(49, 76, 160, 0.1)', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#314ca0'
                }}>
                  📊
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px' }}>{table}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>PostgreSQL Table</span>
                </div>
              </div>
              <button 
                className="modern-action-btn" 
                style={{ 
                  border: '1px solid #314ca0', 
                  color: '#314ca0',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                disabled={exporting === table}
                onClick={() => handleExport(table)}
              >
                {exporting === table ? 'Exporting...' : 'Export to CSV'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '48px', opacity: 0.6 }}>
        {['Snowflake', 'MySQL', 'MongoDB', 'BigQuery'].map(db => (
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
                background: '#f8fafc', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {db === 'Snowflake' ? '❄️' : db === 'MySQL' ? '🐬' : db === 'MongoDB' ? '🍃' : '☁️'}
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{db}</h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Enterprise DB</span>
              </div>
            </div>
            <button className="modern-action-btn" style={{ border: 'none', background: '#f1f5f9', cursor: 'not-allowed' }}>
              Coming Soon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
