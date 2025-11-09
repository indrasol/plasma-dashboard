import { useEffect, useState } from 'react';
import TopInfluencersTable from './TopInfluencersTable';
import InteractiveGraphViewer from './InteractiveGraphViewer';
import ModernDropdown from './ModernDropdown';
import { supabase } from '../supabaseClient';

interface DonorInterest {
  interest_category: string | null;
  interest_name: string | null;
}

export default function TopInfluencers() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedInterestName, setSelectedInterestName] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(true);

  // Load categories and interest names on mount
  useEffect(() => {
    async function loadInterests() {
      try {
        const { data, error } = await supabase
          .from('donor_interests')
          .select('interest_category, interest_name');

        if (error) throw error;

        const typedData = data as DonorInterest[] | null;

        // Unique + cleaned lists
        const categories = [...new Set(
          (typedData || []).map(row => row.interest_category?.trim()).filter((val): val is string => Boolean(val))
        )].sort();

        const names = [...new Set(
          (typedData || []).map(row => row.interest_name?.trim()).filter((val): val is string => Boolean(val))
        )].sort();

        console.log("✅ Loaded interest categories:", categories);
        console.log("✅ Loaded interest names:", names);

        setAvailableCategories(categories);
        setAvailableNames(names);
      } catch (err) {
        console.error("❌ Failed to load interests:", err);
      } finally {
        setLoadingInterests(false);
      }
    }

    loadInterests();
  }, []);

  return (
    <div className="section">
      {/* Influencers Header */}
      <h1 className="dashboard-title">
        Influencers Overview
      </h1>
      
      {/* Modern Dropdown Filters */}
      {!loadingInterests && (
        <div className="modern-filters-container">
          <div className="modern-filters-grid">
            {/* Category Dropdown */}
            <ModernDropdown
              label="Interest Category"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              }
              value={selectedCategory}
              options={availableCategories}
              placeholder="All Categories"
              onChange={setSelectedCategory}
            />

            {/* Name Dropdown */}
            <ModernDropdown
              label="Interest Name"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#314ca0" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              }
              value={selectedInterestName}
              options={availableNames}
              placeholder="All Names"
              onChange={setSelectedInterestName}
            />
          </div>

          {(!!selectedCategory || !!selectedInterestName) && (
            <div className="filter-status">
              <span className="status-icon">🔍</span>
              <span className="status-text">
                Showing results for{" "}
                {selectedCategory && <><span className="filter-tag">category: {selectedCategory}</span></>}
                {selectedCategory && selectedInterestName && <> and </>}
                {selectedInterestName && <><span className="filter-tag">name: {selectedInterestName}</span></>}
              </span>
            </div>
          )}
          
        </div>
      )}

      {/* Paginated Influencer Table */}
      <TopInfluencersTable 
        selectedCategory={selectedCategory}
        selectedInterestName={selectedInterestName}
      />

      {!!(selectedCategory || selectedInterestName) && (
        <>
          <hr />
          <h4>🌐 Influence Network Visualization</h4>

          <InteractiveGraphViewer 
            filterByCategory={selectedCategory}
            filterByInterestName={selectedInterestName}
          />
        </>
      )}
    </div>
  );
}

