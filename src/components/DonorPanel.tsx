import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import LookalikeDashboard from './LookalikeDashboard';
import DonorElasticityDashboard from './DonorElasticityDashboard';
import ClusterSummaryPanel from './ClusterSummaryPanel';
import type { Donor } from '../types/database.types';

interface LoyaltyCount {
  tier: string;
  count: number;
}

export default function DonorPanel() {
  const [donorsData, setDonorsData] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyCounts, setLoyaltyCounts] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const donorsPerPage = 10;
  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = donorsData.slice(indexOfFirstDonor, indexOfLastDonor);
  const totalPages = Math.ceil(donorsData.length / donorsPerPage);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: donors, error } = await supabase.from('donors').select(`
          donor_id,
          gender,
          loyalty_tier,
          donation_frequency_bucket
        `);

        if (error) throw error;

        const typedDonors = donors as Donor[] | null;
        setDonorsData(typedDonors || []);

        // Count by Loyalty Tier for Chart
        const counts: Record<string, number> = {};
        (typedDonors || []).forEach(d => {
          const tier = d.loyalty_tier || "Unknown";
          counts[tier] = (counts[tier] || 0) + 1;
        });

        setLoyaltyCounts(counts);
      } catch (err) {
        console.error("❌ Error loading donor segments:", err);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Convert loyalty counts to array format for Recharts
  const loyaltyChartData: LoyaltyCount[] =
    Object.entries(loyaltyCounts).map(([tier, count]) => ({ tier, count }));

  return (
    <div className="section">
      <h2>🩸 Donor Segments</h2>

      {loading ? (
        <p>⏳ Loading...</p>
      ) : (
        <>
          {/* Loyalty Tier Bar Chart */}
          {loyaltyChartData.length > 0 ? (
            <div style={{ maxWidth:'600px', marginBottom:'2rem' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={loyaltyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tier" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4e79a7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>No loyalty segmentation data found.</p>
          )}

          {/* Raw Data Table */}
          {currentDonors.length > 0 ? (
            <>
              <table className="segment-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Gender</th>
                    <th>Loyalty Tier</th>
                    <th>Frequency Bucket</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDonors.map((d) => (
                    <tr key={d.donor_id}>
                      <td>{d.donor_id.slice(0,6)}...</td>
                      <td>{d.gender}</td>
                      <td>{d.loyalty_tier}</td>
                      <td>{d.donation_frequency_bucket}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="run-btn"
                    style={{ marginRight: '10px' }}
                  >
                    ⬅ Prev
                  </button>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="run-btn"
                  >
                    Next ➡
                  </button>

                  <span style={{ marginLeft: '15px' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}
            </>
          ) : (
            !loading && (<p>No donor records available.</p>)
          )}

          {/* Embedded Dashboards */}
          <>
            {!loading && (<LookalikeDashboard />)}
            {!loading && (<ClusterSummaryPanel selectedCluster={0} />)}
            {!loading && (
              <div style={{ marginTop: '40px' }}>
                <h3>🧬 Cluster Visualization (PCA)</h3>
                <img src="/cluster_plot.png" alt="PCA Plot" width={600} />
              </div>
            )}
            {!loading && (<DonorElasticityDashboard />)}
          </>
        </>
      )}
    </div>
  );
}

