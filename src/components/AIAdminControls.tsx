import { useState } from 'react';
import { API_ENDPOINTS } from '../config/apiEndpoints';

export default function AIAdminControls() {
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const runTask = async (taskName: string, endpoint: string, method: string = 'POST') => {
    try {
      setProcessing(taskName);
      setMessage(null);
      const res = await fetch(endpoint, { method });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ 
          text: `Success: ${data.message || data.count || 'Task'} completed.`, 
          type: 'success' 
        });
      } else {
        throw new Error(data.detail || 'Task failed');
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setProcessing(null);
    }
  };

  const tasks = [
    { 
      id: 'vectorize', 
      name: 'Run Vectorization', 
      desc: 'Aggregate raw donations & health data into features.', 
      endpoint: `${API_ENDPOINTS.base}/api/donors/vectorize`,
      icon: '🧬'
    },
    { 
      id: 'validate', 
      name: 'Validate Clusters', 
      desc: 'Run Elbow & Silhouette analysis on segments.', 
      endpoint: `${API_ENDPOINTS.base}/api/donors/clusters/validate`,
      icon: '📊'
    },
    { 
      id: 'recalc_inf', 
      name: 'Recalculate Influence', 
      desc: 'Update PageRank & Betweenness scores.', 
      endpoint: `${API_ENDPOINTS.base}/api/influencers/recalculate-scores`,
      icon: '🕸️'
    }
  ];

  return (
    <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
      <div className="widget-header">
        <h3 className="widget-title">
          <span className="title-icon">⚙️</span>
          Neural Engine Admin Controls
        </h3>
      </div>
      
      <div style={{ padding: '24px' }}>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Trigger heavy AI processes to refresh the intelligence layer. 
          Use these when new raw data has been uploaded.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {tasks.map(task => (
            <div key={task.id} style={{
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>{task.icon}</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{task.name}</h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>{task.desc}</p>
              </div>
              <button
                disabled={processing !== null}
                onClick={() => runTask(task.name, task.endpoint)}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: processing === task.name ? '#94a3b8' : 'linear-gradient(135deg, #314ca0, #2a4085)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: processing === task.name ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                {processing === task.name ? 'Processing...' : 'Execute Task'}
              </button>
            </div>
          ))}
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
      </div>
    </div>
  );
}

