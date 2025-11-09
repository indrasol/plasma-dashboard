import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import CampaignFunnelWidget from './CampaignFunnelWidget';

interface SummaryStats {
  donorCount: number | string;
  totalVolumeMl: number | string;
  avgDonationSize: number | string;
  influencerCount: number | string;
}


interface MetricTileProps {
  title: string;
  value: number | string;
}

interface DonationHistory {
  quantity_ml: number | null;
  date_of_donation: string;
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
    }

    fetchAll();
  }, []);

  
function MetricTile({ title, value, icon }: MetricTileProps & { icon: JSX.Element }) {
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


return (
<div className="section">
   {/* Dashboard Header */}
   <div style={{ marginBottom: '24px', marginTop: '0' }}>
     <h1 className="dashboard-title" style={{ margin: 0, marginBottom: '8px', fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
       Dashboard
     </h1>
     <p style={{ margin: 0, fontSize: '16px', color: '#64748b', fontWeight: '400' }}>
       Here's what's happening today
     </p>
   </div>

   {/* 🔹 Top Stats Tiles */}
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

   {/* 🎯 Campaign Funnel Widget */}
   <CampaignFunnelWidget />
</div>);
}

