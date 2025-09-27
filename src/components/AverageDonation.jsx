import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AverageDonation() {
  const [averages, setAverages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchAverages() {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_avg_donation_by_center');
    console.log("RPC data:", data, "Error:", error); // <-- Add this line
    if (error) {
      setAverages([]);
    } else {
      setAverages(data || []);
    }
    setLoading(false);
  }
  fetchAverages();
}, []);

  if (loading) return <div>Loading average donations...</div>;

  return (
    <div>
      <h3>Average Donation Volume By Center (ml)</h3>
      <ul>
        {averages.map(({ location_id, avg_quantity }) => (
          <li key={location_id}>
            {location_id}: {avg_quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
