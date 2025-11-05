import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface SummaryStats {
  donorCount: number | string;
  totalVolumeMl: number | string;
  avgDonationSize: number | string;
  influencerCount: number | string;
}

interface CampaignMetrics {
  campaignCount: number | string;
  totalEngaged: number | string;
  totalConverted: number | string;
  avgConversionRate: string;
}

interface MetricTileProps {
  title: string;
  value: number | string;
}

interface DonationHistory {
  quantity_ml: number | null;
  date_of_donation: string;
}

interface CampaignSummaryRow {
  total_engaged: number | null;
  total_converted: number | null;
}

export default function DashboardTiles() {
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    donorCount: '-',
    totalVolumeMl: '-',
    avgDonationSize: '-',
    influencerCount: '-'
  });

  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics>({
    campaignCount: '-',
    totalEngaged: '-',
    totalConverted: '-',
    avgConversionRate: '-'
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        // ✅ Total Donors
        const { count: donorCount } = await supabase.from('donors').select('*', { count: 'exact', head: true });

        // ✅ Influencer Count (e.g., where score > 0)
        const { count: influencerCount } = await supabase
          .from('influencer_scores')
          .select('*', { count: 'exact', head: true })
          .gt('total_score', 0);

        // ✅ Donations YTD only
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;

        const { data: ytdDonations } = await supabase
          .from('donation_history')
          .select('quantity_ml, date_of_donation')
          .gte('date_of_donation', startOfYear);

        const typedDonations = ytdDonations as DonationHistory[] | null;
        const volumesYTD = (typedDonations || []).map(d => d.quantity_ml).filter((v): v is number => v != null);
        const totalYtdVolumeMl = volumesYTD.reduce((sum, v) => sum + v, 0);
        const avgYtdDonationSize =
            volumesYTD.length > 0 ? (totalYtdVolumeMl / volumesYTD.length).toFixed(1) : '-';

        setSummaryStats({
          donorCount: donorCount || 0,
          totalVolumeMl: totalYtdVolumeMl,
          avgDonationSize: avgYtdDonationSize,
          influencerCount: influencerCount || 0
        });
      } catch (err) {
        console.error("❌ Error loading summary stats:", err);
      }

      try {
        // 🎯 Latest campaign metrics for top-level tiles
        const { data, error } = await supabase.rpc('get_campaign_conversion_summary');

        if (error) throw error;

        const campaignData = data as CampaignSummaryRow[] | null;
        const recentTen = (campaignData || []).slice(0,10);
        
        const campaignCount = recentTen.length;
        const totalEngaged = recentTen.reduce((sum, row) => sum + (row.total_engaged || 0), 0);
        const totalConverted = recentTen.reduce((sum, row) => sum + (row.total_converted || 0), 0);
        
        const avgConvRate =
            totalEngaged > 0 ? ((totalConverted / totalEngaged) * 100).toFixed(1) + '%' : '-';

        setCampaignMetrics({
          campaignCount,
          totalEngaged,
          totalConverted,
          avgConversionRate: avgConvRate
        });
      } catch (err) {
        console.error("❌ Error loading campaign metrics:", err);
      }
    }

    fetchAll();
  }, []);

  
function MetricTile({ title, value }: MetricTileProps) {
    return (
      <div className="tile light-accent">
         <h3>{title}</h3>
         <p style={{ fontSize:'1.5rem', marginTop:'10px' }}>{value}</p>
      </div>
    );
}

function DarkTile({ title, value }: MetricTileProps) {
    return (
      <div className="tile" style={{
         backgroundColor:'#1c5470',
         color:'#ffffff'
       }}>
         <h3>{title}</h3>
         <p style={{ fontSize:'1.5rem', marginTop:'10px' }}>{value}</p>
      </div>
    );
}

return (
<div className="section">

   {/* 🔹 Top Stats Tiles */}
   <div className="metric-grid">
     <MetricTile title="Total Donors" value={summaryStats.donorCount} />
     <MetricTile title="Donations YTD" value={`${summaryStats.totalVolumeMl} mL`} />
     <MetricTile title="Avg Donation Size" value={`${summaryStats.avgDonationSize} mL`} />
     <MetricTile title="Influencers" value={summaryStats.influencerCount} />
   </div>

   {/* 🔹 Campaign Summary Tiles */}
   <div className="metric-grid" style={{ marginTop:'2rem' }}>
     <DarkTile title="Campaigns (Last 10)" value={campaignMetrics.campaignCount} />
     <DarkTile title="Total Engaged" value={campaignMetrics.totalEngaged} />
     <DarkTile title="# Conversions" value={campaignMetrics.totalConverted} />
     <DarkTile title="Avg Conv. Rate" value={campaignMetrics.avgConversionRate} />
   </div>

</div>);
}

