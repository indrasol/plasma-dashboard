import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import BarChartDonations from "./BarChartDonations";
import LineChartProgressive from "./LineChartProgressive";

export default function DashboardTiles() {
  const [summaryStats, setSummaryStats] = useState({
    donorCount: '-',
    totalVolumeMl: '-',
    avgDonationSize: '-',
    influencerCount: '-'
  });

  const [campaignMetrics, setCampaignMetrics] = useState({
    campaignCount: '-',
    totalEngaged: '-',
    totalConverted: '-',
    avgConversionRate: '-'
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        // ✅ Total Donors
        let { count: donorCount } = await supabase.from('donors').select('*', { count: 'exact', head: true });

        // ✅ Influencer Count (e.g., where score > 0)
        let { count: influencerCount } = await supabase
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

        const volumesYTD = ytdDonations.map(d => d.quantity_ml).filter(v => v != null);
        const totalYtdVolumeMl = volumesYTD.reduce((sum, v) => sum + v, 0);
        const avgYtdDonationSize =
            volumesYTD.length > 0 ? (totalYtdVolumeMl / volumesYTD.length).toFixed(1) : '-';

        setSummaryStats({
          donorCount,
          totalVolumeMl: totalYtdVolumeMl,
          avgDonationSize: avgYtdDonationSize,
          influencerCount
        });
      } catch (err) {
        console.error("❌ Error loading summary stats:", err);
      }

      try {
        // 🎯 Latest campaign metrics for top-level tiles
        const { data, error } = await supabase.rpc('get_campaign_conversion_summary');
        if (error) throw error;

        // Limit to recent N campaigns for dashboard display
        const recentTen = data.slice(0,10);
        
        // Filter out any bad or incomplete records
        const validRows = recentTen.filter(row =>
          typeof row.total_engaged === 'number' &&
          typeof row.total_converted === 'number' &&
          row.total_engaged > 0
        );

        // Compute aggregate values from filtered campaigns only
        const campaignCount = validRows.length;
        
        const totalEngaged = validRows.reduce((sum, row) => sum + row.total_engaged, 0);
        const totalConverted = validRows.reduce((sum, row) => sum + row.total_converted, 0);

        // Option A — global conversion average using totals:
        let convRateGlobal =
            totalEngaged > 0 ? ((totalConverted / totalEngaged) * 100).toFixed(1) + '%' : '-';

       /* 
       // Optional Option B — alternative per-campaign average:
       let perCampaignRates = validRows.map(row =>
         (row.total_converted / row.total_engaged) * 100);
       let convRateAvg =
           perCampaignRates.length > 0 ? 
           (perCampaignRates.reduce((a,b)=>a+b)/perCampaignRates.length).toFixed(1)+'%' : "-";
       */

       setCampaignMetrics({
         campaignCount,
         totalEngaged,
         totalConverted,
         avgConversionRate: convRateGlobal   // or convRateAvg if you prefer option B!
       });

      } catch (err) {
         console.error("❌ Error loading campaign metrics:", err.message || err);
      }
    }

    fetchAll();
  }, []);


function MetricTile({ title, value }) {
    return (
      <div className="tile light-accent">
         <h3>{title}</h3>
         <p style={{ fontSize:'1.5rem', marginTop:'10px' }}>{value}</p>
      </div>
    );
}

function DarkTile({ title, value }) {
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
     <DarkTile title="Campaigns (Last Valid)" value={campaignMetrics.campaignCount} />
     <DarkTile title="Total Engaged" value={campaignMetrics.totalEngaged} />
     <DarkTile title="# Conversions" value={campaignMetrics.totalConverted} />
     <DarkTile title="Avg Conv. Rate" value={campaignMetrics.avgConversionRate} />
   </div>

</div>);
}