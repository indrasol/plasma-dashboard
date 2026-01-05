import React from 'react';
import LiveSignalsPanel from '../components/LiveSignalsPanel';
import './LiveSignalsPage.css';

const LiveSignalsPage: React.FC = () => {
  return (
    <div className="live-signals-page">
      <div className="signals-grid-container">
        <div className="signals-main-panel">
          <LiveSignalsPanel />
        </div>
        
        <div className="signals-sidebar-info">
          <div className="advanced-info-card glass secondary">
            <h3>Recent Insights</h3>
            <div className="insight-mini-list">
              <div className="mini-insight-item">
                <span className="insight-bullet"></span>
                <p>Spike in donor retention detected in <strong>Cluster 4</strong></p>
              </div>
              <div className="mini-insight-item">
                <span className="insight-bullet"></span>
                <p>Email engagement increasing for <strong>High Value</strong> segment</p>
              </div>
              <div className="mini-insight-item">
                <span className="insight-bullet"></span>
                <p>New influencer trend identified in <strong>West Coast</strong> region</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSignalsPage;

