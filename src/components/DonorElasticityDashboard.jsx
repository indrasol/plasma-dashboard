import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { exportToCSV } from '../utils/exportToCSV';

export default function DonorElasticityDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('donor_elasticity')
        .select('*');

      if (error) console.error(error);
      else setData(data);
    }

    fetchData();
  }, []);

  const elasticOnly = data.filter(d => d.classification === 'elastic');
  const inelasticOnly = data.filter(d => d.classification === 'inelastic');

  return (
    <div className="dashboard-tile light-tile">
      <h4>🎯 Donor Elasticity Summary</h4>

      {/* Elastic Section */}
      <p>
        <strong>Elastic:</strong> {elasticOnly.length}
        {elasticOnly.length > 0 && (
          <button 
            className="run-btn"
            style={{ marginLeft: '10px', fontSize: '0.85rem' }}
            onClick={() => exportToCSV(elasticOnly, "elastic_donors.csv")}
          >
            ⬇ Export Elastic (.csv)
          </button>
        )}
      </p>

      {/* Inelastic Section */}
      <p>
        <strong>Inelastic:</strong> {inelasticOnly.length}
        {inelasticOnly.length > 0 && (
          <button 
            className="run-btn"
            style={{ marginLeft: '10px', fontSize: '0.85rem' }}
            onClick={() => exportToCSV(inelasticOnly, "inelastic_donors.csv")}
          >
            ⬇ Export Inelastic (.csv)
          </button>
        )}
      </p>
    </div>
  );
}