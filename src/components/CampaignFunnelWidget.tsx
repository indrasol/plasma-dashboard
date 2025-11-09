import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface FunnelData {
  campaigns: number;
  engaged: number;
  conversions: number;
  conversionRate: number;
}

interface FunnelStageProps {
  title: string;
  value: number;
  percentage: number;
  color: string;
  icon: JSX.Element;
}

export default function CampaignFunnelWidget() {
  const [funnelData, setFunnelData] = useState<FunnelData>({
    campaigns: 0,
    engaged: 0,
    conversions: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunnelData() {
      setLoading(true);
      try {
        // Get campaign metrics
        const { data, error } = await supabase.rpc('get_campaign_conversion_summary');
        
        if (error) throw error;

        const campaignData = Array.isArray(data) ? data : [];
        const recentCampaigns = campaignData.slice(0, 10);
        
        const campaigns = recentCampaigns.length;
        const engaged = recentCampaigns.reduce((sum: number, row: any) => sum + (row.total_engaged || 0), 0);
        const conversions = recentCampaigns.reduce((sum: number, row: any) => sum + (row.total_converted || 0), 0);
        const conversionRate = engaged > 0 ? (conversions / engaged) * 100 : 0;

        setFunnelData({
          campaigns,
          engaged,
          conversions,
          conversionRate
        });
      } catch (err) {
        console.error("❌ Error loading funnel data:", err);
      }
      setLoading(false);
    }

    fetchFunnelData();
  }, []);

  if (loading) {
    return (
      <div className="funnel-widget loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading funnel data...</p>
      </div>
    );
  }

  const maxValue = Math.max(funnelData.campaigns, funnelData.engaged, funnelData.conversions);

  return (
    <div className="campaign-funnel-widget">
      <div className="funnel-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Campaign Conversion Funnel
        </h3>
        <div className="funnel-subtitle">Last 10 Campaigns Performance</div>
      </div>
      
      <div className="funnel-stages">
        <FunnelStage
          title="Campaigns"
          value={funnelData.campaigns}
          percentage={100}
          color="#314ca0"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          }
        />
        
        <div className="funnel-arrow">→</div>
        
        <FunnelStage
          title="Engaged"
          value={funnelData.engaged}
          percentage={maxValue > 0 ? (funnelData.engaged / maxValue) * 100 : 0}
          color="#D97706"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        
        <div className="funnel-arrow">→</div>
        
        <FunnelStage
          title="Conversions"
          value={funnelData.conversions}
          percentage={maxValue > 0 ? (funnelData.conversions / maxValue) * 100 : 0}
          color="#22c55e"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          }
        />
      </div>

      <div className="funnel-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div className="card-content">
              <h4>Overall Conversion Rate</h4>
              <div 
                className="card-value" 
                style={{ 
                  color: funnelData.conversionRate >= 70 ? '#22c55e' : 
                         funnelData.conversionRate >= 50 ? '#eab308' : 
                         '#ef4444' 
                }}
              >
                {funnelData.conversionRate.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="card-content">
              <h4>Avg Conversions per Campaign</h4>
              <div className="card-value">
                {funnelData.campaigns > 0 ? (funnelData.conversions / funnelData.campaigns).toFixed(1) : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelStage({ title, value, percentage, color, icon }: FunnelStageProps) {
  return (
    <div className="funnel-stage">
      <div className="stage-icon">
        {icon}
      </div>
      <div className="stage-content">
        <h4>{title}</h4>
        <div className="stage-value">{value.toLocaleString()}</div>
        <div className="stage-bar">
          <div 
            className="stage-fill" 
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color 
            }}
          />
        </div>
      </div>
    </div>
  );
}
