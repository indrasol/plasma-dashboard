import { useEffect, useState } from 'react';
import './ClusterSummaryPanel.css';

interface ClusterData {
  cluster: number;
  label: string;
  conversion_rate?: number;
  size?: number;
  channel_preferences?: Record<string, number>;
}

interface ClusterSummaryPanelProps {
  selectedCluster: number;
}

const ClusterSummaryPanel = ({ selectedCluster }: ClusterSummaryPanelProps) => {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/data/donor_clusters_labeled.json')
      .then((res) => res.json())
      .then((data: ClusterData[]) => {
        if (Array.isArray(data)) setClusters(data);
        else throw new Error("Invalid format");
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load clusters:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const currentSummary = clusters.find(c => c.cluster === selectedCluster);

  return (
    <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
      <div className="widget-header">
        <h3 className="widget-title">
          <span className="title-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
              <polyline points="7.5 19.79 7.5 14.6 3 12"/>
              <polyline points="21 12 16.5 14.6 16.5 19.79"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </span>
          AI-Powered Donor Cluster Summaries
        </h3>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading summaries...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p style={{ color: '#E53E3E' }}>Error loading cluster summary.</p>
        </div>
      ) : currentSummary ? (
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          border: '2px solid rgba(49, 76, 160, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid rgba(49, 76, 160, 0.1)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            <h4 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: '#1e293b'
            }}>
              Cluster {currentSummary.cluster}: {currentSummary.label}
            </h4>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {'conversion_rate' in currentSummary && currentSummary.conversion_rate !== undefined && (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #E6E6FF 0%, #f0f0ff 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(49, 76, 160, 0.2)'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#314ca0', 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  Conversion Rate
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
                  {(currentSummary.conversion_rate * 100).toFixed(1)}%
                </div>
              </div>
            )}

            {'size' in currentSummary && currentSummary.size !== undefined && (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #ffe6e6 0%, #fff0f0 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(229, 62, 62, 0.2)'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#E53E3E', 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Cohort Size
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
                  {currentSummary.size.toLocaleString()}
                </div>
              </div>
            )}

            {Object.keys(currentSummary.channel_preferences || {}).length > 0 && (
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #e6f7ff 0%, #f0faff 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#10b981', 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  Channel Preference
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                {Object.entries(currentSummary.channel_preferences || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([ch], i) =>
                    `${i > 0 ? ' > ' : ''}${ch.toUpperCase()}`
                  )}
                </div>
              </div>
            )}
          </div>

          {Object.keys(currentSummary.channel_preferences || {}).length === 0 && (
            <div style={{
              padding: '16px',
              background: 'rgba(229, 62, 62, 0.05)',
              borderRadius: '8px',
              color: '#64748b',
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: '16px'
            }}>
              No channel data available for this cluster
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No summary available for selected cluster.</p>
        </div>
      )}
    </div>
  );
};

export default ClusterSummaryPanel;

