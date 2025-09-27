import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // ✅ Use shared client

export default function DonorElasticityDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('donor_elasticity')
          .select('*');

        if (error) throw error;

        setData(data || []);
      } catch (err) {
        console.error("❌ Error loading elasticity data:", err.message || err);
        setError(err.message || "Unknown error");
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const elasticCount = data.filter(d => d.classification === 'elastic').length;
  const inelasticCount = data.filter(d => d.classification === 'inelastic').length;

  return (
    <div className="dashboard-tile light-tile" style={{ marginTop: '2rem' }}>
      <h3>🎯 Donor Elasticity Summary</h3>

      {loading ? (
        <p>⏳ Loading donor elasticity...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>🚨 Error: {error}</p>
      ) : (
        <>
          <p><strong>Elastic:</strong> {elasticCount}</p>
          <p><strong>Inelastic:</strong> {inelasticCount}</p>
        </>
      )}
    </div>
  );
}