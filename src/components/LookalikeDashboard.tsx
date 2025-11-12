import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import ModernDropdown from './ModernDropdown';
import ClusterSummaryPanel from './ClusterSummaryPanel';
import type { DonorVector } from '../types/database.types';
import type { 
  LookalikeResult, 
  ClusterData, 
  SimilarityMetric, 
  DonationRange 
} from '../types/lookalike.types';

// Use local proxy to avoid CORS issues
const LOOKALIKE_API_URL = 'http://localhost:5001/api/lookalike';

export default function LookalikeDashboard() {
  const [donors, setDonors] = useState<DonorVector[]>([]);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [similarityMetric, setSimilarityMetric] = useState<SimilarityMetric>('cosine');
  const [filterByClusterOnly, setFilterByClusterOnly] = useState(false);
  const [lookalikes, setLookalikes] = useState<LookalikeResult[]>([]);
  const [loadingLookalikes, setLoadingLookalikes] = useState(false);
  const [topN, setTopN] = useState(10);

  // Filters
  const [totalDonationRange, setTotalDonationRange] = useState<DonationRange>('');
  const [avgDonationSize, setAvgDonationSize] = useState<number | ''>('');
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);

  // PCA Plot Data
  const [clusteredData, setClusteredData] = useState<ClusterData[]>([]);
  const [availableClusters, setAvailableClusters] = useState<number[]>([]);

  // Load donors
  useEffect(() => {
    async function fetchDonors() {
      try {
        const { data: donorsData, error } = await supabase
          .from('donor_vectors')
          .select(`
            donor_id,
            name,
            first_name,
            last_name,
            total_donated,
            avg_donation_size,
            donation_count,
            campaign_count,
            health_screening_count
          `);

        if (error) throw error;

        const typedDonors = donorsData as DonorVector[] | null;
        console.log("✅ Donors loaded:", typedDonors?.length);
        setDonors(typedDonors || []);
        if (!selectedDonorId && typedDonors && typedDonors.length > 0) {
          setSelectedDonorId(typedDonors[0].donor_id);
        }
      } catch (err) {
        console.error("❌ Error loading donors:", err);
      }
    }

    fetchDonors();
  }, []);

  // Load cluster plot data (PCA)
  useEffect(() => {
    fetch('/assets/donor_clusters_reduced.json')
      .then((res) => res.json())
      .then((data: ClusterData[]) => {
        console.log("📈 Loaded PCA plot data", data.length);
        setClusteredData(data);

        const uniqueClusters = [...new Set(data.map(d => d.cluster))].sort((a,b)=>a-b);
        console.log("📊 Available Clusters:", uniqueClusters);

        setAvailableClusters(uniqueClusters);
      })
      .catch(err =>
        console.error("❌ Failed loading /assets/donor_clusters_reduced.json", err)
      );
  }, []);

  // Fetch lookalikes when filters change
  useEffect(() => {
    if (!selectedDonorId) {
      console.log("⚠️ No donor selected, skipping fetch");
      return;
    }

    console.log("🚀 Starting fetch for donor:", selectedDonorId);

    async function fetchLookalikes() {
      try {
        setLoadingLookalikes(true);
        setLookalikes([]); // Clear previous results

        const url =
          `${LOOKALIKE_API_URL}?donor_id=${selectedDonorId}` +
          `&metric=${similarityMetric}&top_n=${topN}` +
          (filterByClusterOnly ? '&cluster_only=true' : '');

        console.log("🔍 Fetching lookalikes →", url);

        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        let jsonResp = await res.json();
        if (!Array.isArray(jsonResp)) jsonResp = [];

        console.log("🎯 Raw response:", jsonResp);
        console.log("📊 Response length:", jsonResp.length);
        console.log("📋 First item:", jsonResp[0]);
        setLookalikes(jsonResp as LookalikeResult[]);
      } catch (err) {
        console.error("❌ Failed to load lookalikes:", err);
        // Set empty array on error so UI shows "no results" instead of infinite loading
        setLookalikes([]);
      } finally {
        setLoadingLookalikes(false);
      }
    }

    fetchLookalikes();
  }, [selectedDonorId, similarityMetric, topN, filterByClusterOnly]);

  // Filter logic applied AFTER fetching top-N results
  const filteredResults = lookalikes.filter((d) => {
    const passTotal =
      !totalDonationRange ||
      (totalDonationRange === 'lt_1000' && d.total_donated < 1000) ||
      (totalDonationRange === 'btw_1001_5000' && d.total_donated >= 1001 && d.total_donated <= 5000) ||
      (totalDonationRange === 'btw_5001_10000' && d.total_donated >= 5001 && d.total_donated <= 10000) ||
      (totalDonationRange === 'gt_10000' && d.total_donated > 10000);

    const passAvg =
      !avgDonationSize || Number(d.avg_donation_size ?? '') >= Number(avgDonationSize);

    const passCluster =
      selectedCluster === null || d.cluster_label == null ||
      String(d.cluster_label) === String(selectedCluster);

    return passTotal && passAvg && passCluster;
  });

  // Debug logging
  console.log("🔢 Lookalikes count:", lookalikes.length);
  console.log("✅ Filtered results count:", filteredResults.length);
  console.log("🎚️ Current filters:", { totalDonationRange, avgDonationSize, selectedCluster });

  const clusterColors = [
    '#314ca0',  // Cluster 0 - Primary Blue
    '#E53E3E',  // Cluster 1 - Primary Red
    '#10b981',  // Cluster 2 - Green
    '#f59e0b',  // Cluster 3 - Amber/Orange
    '#8b5cf6'   // Cluster 4+ - Purple
  ];

  // Filter selection styles
  const filterLabelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '14px'
  };

  const checkboxLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer'
  };

  return (
    <div className="section" style={{ marginTop: '48px' }}>
      <h1 className="dashboard-title">
        👤 Lookalike Donor Analytics
      </h1>

      {/* Modern Filter Widget */}
      <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
        <div className="widget-header">
          <h3 className="widget-title">
            <span className="title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </span>
            Search Filters
          </h3>
        </div>

        {/* Filters Section */}
        <div className="modern-filters-container">
          {/* Row 1: Main Selection Dropdowns */}
          <div className="modern-filters-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
            <ModernDropdown
              label="Select Donor"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
              value={selectedDonorId || ''}
              options={donors.map(d => d.donor_id)}
              placeholder="Select a donor"
              onChange={setSelectedDonorId}
              formatOption={(donorId) => {
                const donor = donors.find(d => d.donor_id === donorId);
                return donor ? (donor.name ?? `${donor.first_name} ${donor.last_name}`) : donorId;
              }}
            />

            <ModernDropdown
              label="Similarity Metric"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              }
              value={similarityMetric}
              options={['cosine', 'euclidean']}
              placeholder="Select metric"
              onChange={(val) => setSimilarityMetric(val as SimilarityMetric)}
              formatOption={(val) => val === 'cosine' ? 'Cosine Similarity' : 'Euclidean Distance'}
            />

            <ModernDropdown
              label="Show Top"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M3 3h18v18H3z"/>
                  <path d="M9 9h6v6H9z"/>
                </svg>
              }
              value={String(topN)}
              options={['5', '10', '20']}
              placeholder="Select count"
              onChange={(val) => setTopN(Number(val))}
            />

            <ModernDropdown
              label="Total Donations"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              }
              value={totalDonationRange}
              options={['lt_1000', 'btw_1001_5000', 'btw_5001_10000', 'gt_10000']}
              placeholder="All Ranges"
              onChange={(val) => setTotalDonationRange(val as DonationRange)}
              formatOption={(val) => {
                const formats: Record<string, string> = {
                  'lt_1000': 'Less than $1K',
                  'btw_1001_5000': '$1K–$5K',
                  'btw_5001_10000': '$5K–$10K',
                  'gt_10000': 'Over $10K'
                };
                return formats[val] || val;
              }}
            />
          </div>

          {/* Row 2: Additional Filters */}
          <div className="modern-filters-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>

            <div className="filter-group">
              <label style={filterLabelStyle}>
                Avg Donation Size
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                {[200,300,400].map(size => (
                  <label key={`avg-${size}`} className="filter-radio-label" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    <input 
                      type="radio" 
                      name="avgSize" 
                      checked={avgDonationSize === size}
                      onChange={() => setAvgDonationSize(size)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    ${size}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label style={filterLabelStyle}>
                Cluster Selection
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                <label className="filter-radio-label" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  <input 
                    type="radio" 
                    name="clusterID"
                    value="all"
                    checked={selectedCluster === null}
                    onChange={() => setSelectedCluster(null)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#314ca0' }}
                  />
                  All Clusters
                </label>
                {availableClusters.map(clusterID => (
                  <label key={`c-${clusterID}`} className="filter-radio-label" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    <input 
                      type="radio" 
                      name="clusterID"
                      value={clusterID}
                      checked={selectedCluster === clusterID}
                      onChange={() => setSelectedCluster(clusterID)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#314ca0' }}
                    />
                    #{clusterID}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label style={filterLabelStyle}>
                Cluster Filter
              </label>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox"
                  checked={filterByClusterOnly}
                  onChange={(e) => setFilterByClusterOnly(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#314ca0' }}
                />
                Same cluster only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
        <div className="widget-header">
          <h3 className="widget-title">
            <span className="title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            Top Lookalike Donors
          </h3>
        </div>

        {loadingLookalikes ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 32px',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(49, 76, 160, 0.1)',
              borderTop: '4px solid #314ca0',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              fontWeight: 500,
              margin: 0
            }}>
              Finding similar donors...
            </p>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : lookalikes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <p className="empty-state-title" style={{ fontWeight: 600, marginBottom: '8px' }}>
              No lookalike results available
            </p>
            <p className="empty-state-text" style={{ fontSize: '14px', margin: 0 }}>
              The API service may be unavailable or starting up. Please try again in a moment.
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p className="empty-state-title">No lookalike results match your current filters.</p>
          </div>
        ) : (
          <div className="modern-table-container">
            <table className='modern-influencer-table'>
              <thead>
                <tr>
                  <th>
                    <span className="th-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    Name
                  </th>
                  <th>
                    <span className="th-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </span>
                    Total Donated
                  </th>
                  <th>
                    <span className="th-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    </span>
                    # Donations
                  </th>
                  <th>
                    <span className="th-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                        <line x1="4" y1="22" x2="4" y2="15"/>
                      </svg>
                    </span>
                    Campaigns
                  </th>
                  <th>
                    <span className="th-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                      </svg>
                    </span>
                    Screens
                  </th>
                  <th>
                    <span className="th-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9"/>
                        <line x1="15" y1="9" x2="15.01" y2="9"/>
                      </svg>
                    </span>
                    {similarityMetric === "cosine" ? "Similarity" : "Neg. Distance"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((l, index) => (
                  <tr key={l.donor_id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td>
                      <div className="name-cell">
                        <div className="influencer-avatar">
                          {(l.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="influencer-name" style={{ fontSize: '14px' }}>
                          {l.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="score-badge" style={{ 
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        fontSize: '13px'
                      }}>
                        ${l.total_donated?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>
                        {l.donation_count ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>
                        {l.campaign_count ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>
                        {l.health_screening_count ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span className="donors-count" style={{ fontSize: '13px' }}>
                        {typeof l.similarity === 'number'
                          ? similarityMetric === 'cosine'
                            ? l.similarity.toFixed(4)
                            : (-l.similarity).toFixed(4)
                          : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PCA Chart */}
      {clusteredData.length > 0 && (
        <div className="modern-influencer-widget" style={{ marginBottom: '32px' }}>
          <div className="widget-header">
            <h3 className="widget-title">
              <span className="title-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="19" cy="5" r="2"/>
                  <circle cx="5" cy="19" r="2"/>
                  <circle cx="19" cy="19" r="2"/>
                  <circle cx="5" cy="5" r="2"/>
                  <line x1="12" y1="12" x2="19" y2="5"/>
                  <line x1="12" y1="12" x2="5" y2="19"/>
                  <line x1="12" y1="12" x2="19" y2="19"/>
                  <line x1="12" y1="12" x2="5" y2="5"/>
                </svg>
              </span>
              Cluster Visualization (PCA)
            </h3>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '20px'
          }}>
            <ScatterChart width={700} height={450}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(49, 76, 160, 0.1)" />
              <XAxis 
                dataKey="x" 
                type="number"
                tick={{ fill: '#1e293b', fontWeight: 600 }}
                axisLine={{ stroke: '#314ca0' }}
                label={{ value: 'PC1', position: 'insideBottom', offset: -5, fill: '#314ca0', fontWeight: 700 }}
              />
              <YAxis 
                dataKey="y" 
                type="number"
                tick={{ fill: '#1e293b', fontWeight: 600 }}
                axisLine={{ stroke: '#314ca0' }}
                label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: '#314ca0', fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '2px solid #314ca0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(49, 76, 160, 0.2)'
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                  fontWeight: 600,
                  color: '#1e293b'
                }}
              />

              {availableClusters.map(c => (
                <Scatter 
                  key={`scatter-${c}`}
                  data={clusteredData.filter(d => d.cluster === c)}
                  name={`Cluster ${c}`}
                  fill={clusterColors[c % clusterColors.length]}
                />
              ))}
            </ScatterChart>
          </div>
        </div>
      )}

      {/* Smart Summary Component */}
      <ClusterSummaryPanel selectedCluster={parseInt(String(selectedCluster))} />

      <div style={{ 
        marginTop: '24px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #E6E6FF 0%, #f0f0ff 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(49, 76, 160, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>ℹ️</span>
        <p style={{ 
          fontStyle: 'italic', 
          color: '#314ca0',
          margin: 0,
          fontWeight: 500,
          fontSize: '14px'
        }}>
          Note: Backend must populate cluster_label field in Supabase for full functionality.
        </p>
      </div>

    </div>
  );
}

