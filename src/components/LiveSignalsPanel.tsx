import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiEndpoints';

type SignalType = 'alert' | 'warning' | 'suggestion' | 'info' | string;

interface AISignal {
  type: SignalType;
  message: string;
  timestamp: string;
  confidence?: number;
  impact?: 'high' | 'medium' | 'low';
}

const REFRESH_MS = 60_000;

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return then.toLocaleDateString();
  } catch (e) {
    return 'Recently';
  }
}

export default function LiveSignalsPanel() {
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'suggestion' | 'info'>('all');

  const fetchSignals = async () => {
    try {
      const res = await fetch((API_ENDPOINTS.aiSignals || '/api/ai-signals').replace(/\/+$/, ''));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSignals(data);
    } catch (err) {
      setError('Unable to load live signals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const filteredSignals = useMemo(() => {
    if (activeTab === 'all') return signals;
    if (activeTab === 'suggestion') return signals.filter(s => s.type.toLowerCase() === 'suggestion');
    // For 'info', include info, warning, and alert types
    return signals.filter(s => ['info', 'warning', 'alert'].includes(s.type.toLowerCase()));
  }, [signals, activeTab]);

  const getTypeStyles = (type: SignalType) => {
    switch (type.toLowerCase()) {
      case 'alert': 
        return { 
          color: '#ef4444', 
          bg: '#fef2f2', 
          border: '#fee2e2', 
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ) 
        };
      case 'warning': 
        return { 
          color: '#f59e0b', 
          bg: '#fffbeb', 
          border: '#fef3c7', 
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          ) 
        };
      case 'suggestion': 
        return { 
          color: '#10b981', 
          bg: '#ecfdf5', 
          border: '#d1fae5', 
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
              <path d="M12 2v6l4 2-4 2v6"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) 
        };
      default: 
        return { 
          color: '#3b82f6', 
          bg: '#eff6ff', 
          border: '#dbeafe', 
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          ) 
        };
    }
  };

  return (
    <div className="modern-influencer-widget" style={{ padding: '24px', minHeight: '400px' }}>
      <div className="widget-header" style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
          <h3 className="widget-title" style={{ fontSize: '22px' }}>
            <span className="title-icon" style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              padding: '10px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white',
                animation: 'pulse-red 2s infinite'
              }}></span>
            </span> 
            Neural Signals
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'suggestion', 'info'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === tab ? '#314ca0' : '#f1f5f9',
                  color: activeTab === tab ? 'white' : '#64748b',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
          Neural engine monitoring donor patterns and identifying high-impact opportunities in real-time.
        </p>
      </div>

      <div className="signals-list" style={{ display: 'grid', gap: '12px' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Engaging AI models...</p>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <div style={{ marginBottom: '16px', opacity: 0.5 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 9h8"/>
                <path d="M8 13h6"/>
              </svg>
            </div>
            <h4 style={{ margin: '0 0 4px', color: '#1e293b' }}>Quiet on the horizon</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>No new {activeTab} signals detected for your current data.</p>
          </div>
        ) : (
          filteredSignals.map((s, idx) => {
            const styles = getTypeStyles(s.type);
            return (
              <div
                key={idx}
                style={{
                  background: 'white',
                  border: `1px solid ${styles.border}`,
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: styles.bg,
                    color: styles.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    {styles.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          color: styles.color, 
                          textTransform: 'uppercase', 
                          letterSpacing: '1px',
                          padding: '2px 8px',
                          background: `${styles.color}15`,
                          borderRadius: '4px'
                        }}>
                          {s.type}
                        </span>
                        {s.impact === 'high' && (
                          <span style={{ 
                            background: 'linear-gradient(90deg, #ef4444, #f87171)', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '10px', 
                            fontWeight: 800,
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                          }}>
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, fontFamily: 'monospace' }}>
                        [{formatRelativeTime(s.timestamp)}]
                      </span>
                    </div>
                    <p style={{ margin: '0 0 12px', color: '#1e293b', fontWeight: 600, fontSize: '15px', lineHeight: '1.4' }}>
                      {s.message}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                      {!['info', 'suggestion'].includes(s.type.toLowerCase()) && (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                          Confidence: {(s.confidence || 0.85 * 100).toFixed(0)}%
                        </span>
                      )}
                      {s.type.toLowerCase() === 'suggestion' && (
                        <button
                          onClick={() => alert(`Initiating workflow: ${s.message}`)}
                          style={{
                            padding: '6px 14px',
                            background: `linear-gradient(135deg, ${styles.color} 0%, ${styles.color}dd 100%)`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: `0 4px 10px ${styles.color}44`,
                            transition: 'all 0.2s'
                          }}
                        >
                          Execute Strategy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

