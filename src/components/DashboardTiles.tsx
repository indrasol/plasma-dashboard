import { useEffect, useState, type ReactElement } from 'react';
import { API_ENDPOINTS } from '../config/apiEndpoints';
import CampaignFunnelWidget from './CampaignFunnelWidget';

interface SummaryStats {
  donorCount: number | string;
  totalVolumeMl: number | string;
  avgDonationSize: number | string;
  influencerCount: number | string;
}

interface DonationHistory {
  quantity_ml: number | null;
  date_of_donation: string;
}

interface MetricTileProps {
  title: string;
  value: number | string;
  icon: ReactElement;
}

function MetricTile({ title, value, icon }: MetricTileProps) {
  return (
    <div className="modern-metric-tile">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3>{title}</h3>
        <p className="metric-value">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardTiles() {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    donorCount: '-',
    totalVolumeMl: '-',
    avgDonationSize: '-',
    influencerCount: '-'
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        const response = await fetch(API_ENDPOINTS.donorStats);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        setSummaryStats({
          donorCount: data.donorCount,
          totalVolumeMl: data.totalVolumeMl,
          avgDonationSize: data.avgDonationSize,
          influencerCount: data.influencerCount
        });
      } catch (err) {
        console.error("❌ Error loading summary stats:", err);
      }
    }

    fetchAll();
  }, []);

  return (
    <div className="section">
      <div style={{ marginBottom: '24px', marginTop: '0' }}>
        <h1 className="dashboard-title" style={{ margin: 0, marginBottom: '8px', fontSize: '32px', fontWeight: '700' }}>
          Dashboard
        </h1>
        <p className="dashboard-subtitle" style={{ margin: 0, fontSize: '16px', fontWeight: '400' }}>
          Here's what's happening today
        </p>
      </div>

      <div className="metric-grid" style={{ marginBottom: '40px' }}>
        <MetricTile 
          title="Total Donors" 
          value={summaryStats.donorCount}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          }
        />
        <MetricTile 
          title="Donations YTD" 
          value={`${summaryStats.totalVolumeMl} mL`}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          }
        />
        <MetricTile 
          title="Avg Donation Size" 
          value={`${summaryStats.avgDonationSize} mL`}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M3 12h18"/>
              <path d="M8 8v8"/>
              <path d="M12 4v16"/>
              <path d="M16 6v12"/>
              <path d="M20 10v4"/>
              <circle cx="12" cy="12" r="2" fill="#314ca0"/>
            </svg>
          }
        />
        <MetricTile 
          title="Influencers" 
          value={summaryStats.influencerCount}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
      </div>

      <CampaignFunnelWidget />
    </div>
  );
}

