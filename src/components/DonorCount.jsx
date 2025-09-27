import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function DonorCount() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDonorCount() {
      setLoading(true);
      const { count, error } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching donor count:', error);
        setCount(null);
      } else {
        setCount(count);
      }
      setLoading(false);
    }

    fetchDonorCount();
  }, []);

  return (
    <div style={{ padding: 20, fontSize: 20 }}>
      {loading && 'Loading donor count...'}
      {count !== null && !loading && <div>Total donors: {count}</div>}
      {count === null && !loading && <div>Error loading data</div>}
    </div>
  );
}
