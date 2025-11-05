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
    <div className="summary-panel">
      <h2 className="sectionHeader">🧠 AI-Powered Donor Cluster Summaries</h2>

      {loading && <p>⏳ Loading summaries...</p>}
      {error && <p style={{ color: 'red' }}>⚠️ Error loading cluster summary.</p>}

      {!loading && !error && currentSummary ? (
        <div key={currentSummary.cluster} className="summary-card">
          <h3 className="tileTitle">🔹 Cluster {currentSummary.cluster}: {currentSummary.label}</h3>
          <ul>
            {'conversion_rate' in currentSummary && currentSummary.conversion_rate !== undefined &&
              <li><strong>Conversion Rate:</strong> {(currentSummary.conversion_rate * 100).toFixed(1)}%</li>}
            {'size' in currentSummary && currentSummary.size !== undefined &&
              <li><strong>Cohort Size:</strong> {currentSummary.size}</li>}
            {Object.keys(currentSummary.channel_preferences || {}).length > 0 ? (
              <li>
                <strong>Channel Preference:</strong>&nbsp;
                {Object.entries(currentSummary.channel_preferences || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([ch], i) =>
                    `${i > 0 ? ' > ' : ''}${ch.toUpperCase()}`
                  )}
              </li>
            ) : (
              <li><em>No channel data available</em></li>
            )}
          </ul>
          <hr />
        </div>
      ) : (
        !loading && !error &&
        <p style={{ fontStyle: "italic" }}>No summary available for selected cluster.</p>
      )}
    </div>
  );
};

export default ClusterSummaryPanel;

