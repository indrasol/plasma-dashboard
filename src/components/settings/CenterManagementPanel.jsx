import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function CenterManagementPanel() {
  const [centers, setCenters] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  // Load all centers on mount
  useEffect(() => {
    fetchCenters();
  }, []);

  async function fetchCenters() {
    const { data, error } = await supabase.from('centers').select('*').order('name');
    if (error) {
      console.error("❌ Error fetching centers:", error.message);
    }
    setCenters(data || []);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleAddCenter(e) {
    e.preventDefault();
    if (!formData.name) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('centers').insert([
        {
          name: formData.name,
          location: formData.location || null
        }
      ]);
      if (error) throw error;

      alert("✅ Center added!");
      setFormData({ name: '', location: '' });
      fetchCenters();

    } catch (err) {
      console.error("❌ Error adding center:", err.message);
      alert("Failed to add center.");
      
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-tile light-tile" style={{ marginTop:'2rem' }}>
      <h3>🏥 Center Management</h3>

      {/* Form to Add New Center */}
      <form onSubmit={handleAddCenter} style={{ marginBottom:'1rem' }}>
        <input 
          type="text"
          placeholder="Center Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input 
          type="text"
          placeholder="Location (Optional)"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>➕ Add Center</button>
      </form>

      {/* Centers Table */}
      {!centers.length ? (
        <p>⏳ Loading...</p>
      ) : (
        <table className="conversion-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {centers.map(center => (
              <tr key={center.id}>
                <td>{center.name}</td>
                <td>{center.location ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}