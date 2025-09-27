import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // ✅ Shared client import

export default function TopDonors() {
  const [topDonors, setTopDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTopDonors() {
      try {
        const { data, error } = await supabase.rpc('get_top_donors', { limit_count: 5 });

        if (error) throw error;

        setTopDonors(data || []);
      } catch (err) {
        console.error("❌ Error fetching top donors:", err.message || err);
        setError(err.message || "Unknown error");
        setTopDonors([]);
      }
      setLoading(false);
    }

    fetchTopDonors();
  }, []);

  if (loading) return <p>⏳ Loading top donors...</p>;
  if (error) return <p style={{ color: 'red' }}>🚨 {error}</p>;

  return (
    <div className="dashboard-tile light-tile" style={{ marginTop: '2rem' }}>
      <h3>🏅 Top Donors by Volume</h3>
      {topDonors.length > 0 ? (
        <ol>
          {topDonors.map(({ donor_id, full_name, location_id, total_volume }) => (
            <li key={donor_id}>
              <strong>{full_name}</strong> ({location_id}) – 
              Volume: {total_volume.toLocaleString()} mL
            </li>
          ))}
        </ol>
      ) : (
        <p>No donor data available.</p>
      )}
    </div>
  );
}