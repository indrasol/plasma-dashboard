import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function TotalDonations() {
  const [totals, setTotals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTotals() {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_total_donations_by_center'); // we'll create this RPC below

      if (error) {
        console.error("Error fetching totals:", error);
        setTotals([]);
      } else {
        setTotals(data);
      }
      setLoading(false);
    }

    fetchTotals();
  }, []);

  if (loading) return <div>Loading totals...</div>;

  return (
    <div>
      <h3>Total Donations By Center</h3>
      <ul>
        {totals.map((center) => (
          <li key={center.location_id}>
            {center.location_id}: {center.total_donations}
          </li>
        ))}
      </ul>
    </div>
  );
}
