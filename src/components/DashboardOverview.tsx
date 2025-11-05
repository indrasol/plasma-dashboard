import { useState, ReactNode } from 'react';
import DashboardTiles from './DashboardTiles';
import InfluencerLookalikeTable from './InfluencerLookalikeTable';

interface EntityCardProps {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: ReactNode;
}

export default function DashboardOverview() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionName: string) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  return (
    <div className="section">
      {/* 🔝 Top Metric Tiles */}
      <DashboardTiles />

      {/* 👇 Drilldown Cards */}
      <div className="entity-grid" style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        
        {/* Donors Section */}
        <EntityCard 
          title="🩸 Donors"
          isOpen={openSection === "donors"}
          onClick={() => toggleSection("donors")}
        >
          <p>Coming soon: donation trends, loyalty segments...</p>
        </EntityCard>

        {/* Influencers Section */}
        <EntityCard 
          title="🌐 Influencers"
          isOpen={openSection === "influencers"}
          onClick={() => toggleSection("influencers")}
        >
          <InfluencerLookalikeTable />
        </EntityCard>

        {/* Campaigns Section */}
        <EntityCard 
          title="📢 Campaigns"
          isOpen={openSection === "campaigns"}
          onClick={() => toggleSection("campaigns")}
        >
          {/* Already rendered inside DashboardTiles above — you can pull out just campaign chart here later if needed */}
          <p>See campaign conversions above ↑</p>
        </EntityCard>

        {/* Users Section */}
        <EntityCard 
          title="👤 Users"
          isOpen={openSection === "users"}
          onClick={() => toggleSection("users")}
        >
          <p>Coming soon: user logins, permissions...</p>
        </EntityCard>
      </div>
    </div>
  );
}

function EntityCard({ title, isOpen, onClick, children }: EntityCardProps) {
  return (
    <div className="entity-tile light-tile full-width-tile">
      <h3 style={{ cursor: 'pointer' }} onClick={onClick}>
        {title} {isOpen ? '▲' : '▼'}
      </h3>
      {isOpen && (
        <div style={{ marginTop: '10px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

