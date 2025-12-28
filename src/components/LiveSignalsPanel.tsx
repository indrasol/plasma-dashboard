import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiEndpoints';

type SignalType = 'alert' | 'warning' | 'suggestion' | 'info' | string;

interface AISignal {
  type: SignalType;
  message: string;
  timestamp: string;
}

const REFRESH_MS = 60_000;

export default function LiveSignalsPanel() {
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signalsApiUrl = useMemo(() => {
    // Allow relative /api if API base is empty (local proxy)
    return (API_ENDPOINTS.aiSignals || '/api/ai-signals').replace(/\/+$/, '');
  }, []);

  const fetchSignals = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      setError(null);
      const res = await fetch(signalsApiUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as AISignal[];
      setSignals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching AI signals:', err);
      setError('Unable to load live signals right now.');
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const badgeColor = (type: SignalType) => {
    if (type === 'alert') return '#E53E3E';
    if (type === 'warning') return '#f59e0b';
    if (type === 'suggestion') return '#10b981';
    return '#314ca0';
  };

  return (
    <div className="modern-influencer-widget">
      <div className="widget-header" style={{ alignItems: 'center' }}>
        <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="title-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16l5-5h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
              <path d="M17 7h1a2 2 0 0 1 2 2v10l-3-3"/>
            </svg>
          </span>
          Live AI Signals
        </h3>
        <p style={{ margin: 0, color: '#64748b', fontWeight: 600, fontSize: '13px' }}>
          Real-time insights from AI models
        </p>
      </div>

      <div style={{ padding: '4px 12px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontWeight: 600 }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(49, 76, 160, 0.15)',
              borderTop: '3px solid #314ca0',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading live signals...
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <p className="empty-state-title" style={{ marginBottom: '8px' }}>{error}</p>
            <button className="action-btn" onClick={fetchSignals} style={{ padding: '8px 14px' }}>
              Retry
            </button>
          </div>
        ) : signals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <p className="empty-state-title" style={{ marginBottom: '4px' }}>No current insights available.</p>
            <p className="empty-state-text" style={{ fontSize: '13px', margin: 0, color: '#64748b' }}>
              Check back soon for new AI recommendations.
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
            {signals.map((s, idx) => (
              <li key={`${s.timestamp}-${idx}`} style={{
                background: 'white',
                border: '1px solid rgba(49, 76, 160, 0.12)',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 4px 12px rgba(49, 76, 160, 0.08)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '72px',
                      padding: '6px 10px',
                      borderRadius: '10px',
                      background: badgeColor(s.type),
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '12px',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      {s.type || 'INFO'}
                    </span>
                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '14px' }}>
                      {s.message}
                    </div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {new Date(s.timestamp).toLocaleString()}
                  </div>
                </div>

                {s.type === 'suggestion' && s.message?.includes('Donor ') && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      className="action-btn"
                      onClick={() => {
                        const parts = s.message.match(/Donor (.*?) has/);
                        const name = parts?.[1] || '';
                        alert(`🚀 Triggering outreach flow for ${name}`);
                      }}
                    >
                      ➕ Assign Outreach
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

