import { useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph from 'force-graph';
import * as d3 from 'd3-force';
import { API_ENDPOINTS } from '../config/apiEndpoints';

interface Node {
  id: string;
  label: string;
  title: string;
  shape: string;
  size: number;
  color: string;
  val?: number; // for force-graph node size
  x?: number;
  y?: number;
}

interface Edge {
  from: string;
  to: string;
  source?: string;
  target?: string;
  title: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface InfluenceNetworkGraphProps {
  topN?: number;
  interest?: string;
  category?: string;
}

// Sub-component for individual influencer mind map
function InfluencerMindMap({ influencer, nodes, links, color, onExpand, isExpanded, onBack, isSelected }: { 
  influencer: Node, 
  nodes: any[], 
  links: any[],
  color: string,
  onExpand?: () => void,
  isExpanded?: boolean,
  onBack?: () => void,
  isSelected?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInstance = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showListView, setShowListView] = useState(false);

  const toggleView = () => {
    setShowListView(!showListView);
  };

  const handleProfileClick = () => {
    if (onExpand) onExpand();
  };

  const getMetadata = (title: string, key: string) => {
    const match = title.match(new RegExp(`<b>${key}:</b>\\s*([^<]+)`));
    return match ? match[1].trim() : 'N/A';
  };

  const loyaltyTier = useMemo(() => getMetadata(influencer.title, 'Loyalty'), [influencer.title]);
  const gender = useMemo(() => getMetadata(influencer.title, 'Gender'), [influencer.title]);

  useEffect(() => {
    if (!containerRef.current || showListView) return;

    if (!graphInstance.current) {
      graphInstance.current = ForceGraph()(containerRef.current);
    }

    const graph = graphInstance.current;
    
    graph
      .graphData({ nodes, links })
      .width(containerRef.current.clientWidth)
      .height(isExpanded ? 500 : 280) // Larger in full view
      .backgroundColor('#ffffff')
      .nodeColor(node => (node as any).color)
      .nodeLabel(node => {
        const n = node as any;
        return `<div style="background: white; color: #1e293b; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); font-family: sans-serif; min-width: 150px;">
          <div style="font-weight: bold; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 4px; color: ${color};">${n.label}</div>
          ${n.title}
        </div>`;
      })
      .linkDirectionalParticles(1)
      .linkDirectionalParticleSpeed(0.005)
      .linkColor(() => '#e2e8f0')
      .linkWidth(1.5)
      .linkCurvature(0.2)
      .enableZoomInteraction(false) // Disable scroll/pinch zoom
      .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.label;
        const isInfluencer = node.id === influencer.id;
        const fontSize = (isInfluencer ? 14 : 9) / globalScale;
        ctx.font = `${isInfluencer ? '700' : '400'} ${fontSize}px Inter, system-ui, sans-serif`;
        
        const r = isInfluencer ? 8 : 4;
        
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        if (isInfluencer) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();
        }

        // Label
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + 2);

        if (isInfluencer || globalScale > 2) {
          ctx.fillStyle = isInfluencer ? 'rgba(255, 255, 255, 0.9)' : 'transparent';
          
          if (isInfluencer) {
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + r + 2, bckgDimensions[0], bckgDimensions[1]);
          }

          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = isInfluencer ? '#1e293b' : '#64748b';
          ctx.fillText(label, node.x, node.y + r + 2);
        }
      })
      .d3Force('charge', d3.forceManyBody().strength(-200))
      .d3Force('center', d3.forceCenter(0, 0))
      .warmupTicks(100)
      .onEngineStop(() => {
        graph.zoomToFit(400, 40);
      });

    const handleResize = () => {
      if (containerRef.current && graphInstance.current) {
        graphInstance.current.width(containerRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (graphInstance.current) {
        if (containerRef.current) containerRef.current.innerHTML = '';
        graphInstance.current = null;
      }
    };
  }, [nodes, links, influencer.id, color, isExpanded, showListView]);

  const actionButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #f1f5f9',
    background: '#fff',
    color: '#475569',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  };

  return (
    <div 
      className={`influencer-card ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '24px',
        border: `2px solid ${isSelected ? color : (isHovered || isExpanded ? color : '#f1f5f9')}`,
        padding: isExpanded ? '40px' : '24px',
        boxShadow: isSelected
          ? `0 0 0 4px ${color}22, 0 20px 25px -5px ${color}11`
          : (isHovered || isExpanded
            ? `0 20px 25px -5px ${color}11, 0 8px 10px -6px ${color}11` 
            : '0 4px 20px -4px rgba(0,0,0,0.05)'),
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: (isHovered || isSelected) && !isExpanded ? 'translateY(-8px)' : 'none',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: isExpanded ? '1000px' : 'none',
        margin: isExpanded ? '0 auto' : '0'
      }}
    >
      {isExpanded && (
        <button 
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '100px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Network
        </button>
      )}

      {/* Top Status Indicators */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: isExpanded ? '200px' : '100px',
        height: isExpanded ? '200px' : '100px',
        background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isExpanded ? 'center' : 'flex-start', 
        zIndex: 1,
        marginTop: isExpanded ? '24px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isExpanded ? '24px' : '14px' }}>
          <div style={{
            width: isExpanded ? '72px' : '48px',
            height: isExpanded ? '72px' : '48px',
            borderRadius: isExpanded ? '20px' : '14px',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: isExpanded ? '28px' : '20px',
            boxShadow: `0 8px 16px ${color}33`,
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}>
            {influencer.label.charAt(0)}
          </div>
          <div>
            <h4 style={{ margin: 0, color: '#1e293b', fontSize: isExpanded ? '28px' : '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>{influencer.label}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span style={{ 
                padding: isExpanded ? '4px 12px' : '2px 8px', 
                background: `${color}15`, 
                color: color, 
                borderRadius: '6px', 
                fontSize: isExpanded ? '13px' : '11px', 
                fontWeight: 700 
              }}>
                {links.length} Referrals
              </span>
              <span style={{ 
                padding: isExpanded ? '4px 12px' : '2px 8px', 
                background: `${color}15`, 
                color: color, 
                borderRadius: '6px', 
                fontSize: isExpanded ? '13px' : '11px', 
                fontWeight: 700 
              }}>
                {loyaltyTier}
              </span>
              <span style={{ 
                padding: isExpanded ? '4px 12px' : '2px 8px', 
                background: `${color}15`, 
                color: color, 
                borderRadius: '6px', 
                fontSize: isExpanded ? '13px' : '11px', 
                fontWeight: 700 
              }}>
                {gender}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: isExpanded ? '500px' : '280px' }}>
        {/* Graph View */}
        <div 
          ref={containerRef} 
          style={{ 
            width: '100%', 
            height: isExpanded ? '500px' : '280px', 
            background: '#f8fafc', 
            borderRadius: '24px', 
            overflow: 'hidden',
            border: '1px solid #f1f5f9',
            display: showListView ? 'none' : 'block'
          }} 
        />

        {/* List View (Drill Down) */}
        {showListView && (
          <div style={{
            width: '100%',
            height: isExpanded ? '500px' : '280px',
            background: '#f8fafc',
            borderRadius: '24px',
            border: '1px solid #f1f5f9',
            padding: isExpanded ? '32px' : '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: isExpanded ? '16px' : '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>DIRECT REFERRALS</span>
              <span>IMPACT MATCH</span>
            </div>
            {nodes.filter(n => n.id !== influencer.id).map((node, i) => (
              <div key={node.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isExpanded ? '16px 24px' : '10px 12px',
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #edf2f7',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: isExpanded ? '16px' : '13px', fontWeight: 600, color: '#1e293b' }}>{node.label}</span>
                </div>
                <span style={{ fontSize: isExpanded ? '14px' : '11px', fontWeight: 700, color: color }}>
                  {Math.floor(80 + Math.random() * 20)}% Match
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        paddingTop: isExpanded ? '20px' : '4px',
        borderTop: '1px solid #f1f5f9',
        marginTop: 'auto'
      }}>
        <button 
          className="card-action-btn"
          onClick={toggleView}
          style={{
            ...actionButtonStyle, 
            flex: 1, 
            justifyContent: 'center',
            height: isExpanded ? '48px' : 'auto',
            background: showListView ? `${color}10` : '#fff',
            borderColor: showListView ? color : '#f1f5f9',
            color: showListView ? color : '#475569',
            fontSize: isExpanded ? '14px' : '12px'
          }}
          onMouseEnter={(e) => {
            if (!showListView) {
              (e.currentTarget as any).style.background = '#f8fafc';
              (e.currentTarget as any).style.borderColor = '#e2e8f0';
            }
          }}
          onMouseLeave={(e) => {
            if (!showListView) {
              (e.currentTarget as any).style.background = '#fff';
              (e.currentTarget as any).style.borderColor = '#f1f5f9';
            }
          }}
        >
          <svg width={isExpanded ? 18 : 14} height={isExpanded ? 18 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {showListView ? (
              <path d="M3 3h18v18H3zM3 9h18M3 15h18" />
            ) : (
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            )}
          </svg>
          {showListView ? 'Switch to Map View' : 'Drill down to Referrals'}
        </button>
        {!isExpanded && (
          <button 
            className="card-action-btn primary"
            onClick={handleProfileClick}
            style={{
              ...actionButtonStyle, 
              background: color, 
              color: '#fff', 
              borderColor: color,
              flex: 0.4,
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as any).style.opacity = '0.9';
              (e.currentTarget as any).style.boxShadow = `0 4px 12px ${color}44`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as any).style.opacity = '1';
              (e.currentTarget as any).style.boxShadow = 'none';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function InfluenceNetworkGraph({ 
  topN = 15, 
  interest = '', 
  category = '' 
}: InfluenceNetworkGraphProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null);
  const [expandedInfluencerId, setExpandedInfluencerId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGraphData() {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(API_ENDPOINTS.influencerGraph, window.location.origin);
        url.searchParams.append('top_n', String(topN));
        if (interest) url.searchParams.append('interest', interest);
        if (category) url.searchParams.append('category', category);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data: GraphData = await response.json();
        setGraphData(data);
      } catch (err) {
        console.error('❌ Failed to load influence graph:', err);
        setError('Unable to load the influence network graph.');
      } finally {
        setLoading(false);
      }
    }

    fetchGraphData();
  }, [topN, interest, category]);

  const influencers = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes.filter(n => n.shape === 'star');
  }, [graphData]);

  const groupedData = useMemo(() => {
    if (!graphData || !influencers.length) return [];

    return influencers.map(inf => {
      const influencerLinks = graphData.edges.filter(e => e.from === inf.id);
      const connectedNodeIds = new Set([inf.id, ...influencerLinks.map(e => e.to)]);
      const influencerNodes = graphData.nodes.filter(n => connectedNodeIds.has(n.id));
      
      const subNodes = influencerNodes.map(n => ({
        ...n,
        val: n.id === inf.id ? 10 : 4,
        color: n.color // Use the color from API (which is now loyalty-based)
      }));

      const subLinks = influencerLinks.map(e => ({
        source: e.from,
        target: e.to,
        title: e.title
      }));

      return {
        influencer: inf,
        nodes: subNodes,
        links: subLinks,
        color: inf.color
      };
    });
  }, [graphData, influencers]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
        <div className="loader" style={{ margin: '0 auto 20px', width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontWeight: 600 }}>Analyzing Influence Networks...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #fee2e2' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#ef4444', fontWeight: 700 }}>{error}</p>
      </div>
    );
  }

  // Find data for expanded card
  const expandedData = expandedInfluencerId 
    ? groupedData.find(d => d.influencer.id === expandedInfluencerId)
    : null;

  return (
    <div className="modern-influence-widget" style={{ marginBottom: '40px' }}>
      {!expandedInfluencerId ? (
        <>
          {/* Influencer Quick Selection */}
          <div className="influencer-nav" style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            padding: '8px 4px 24px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {influencers.map(inf => (
              <button
                key={inf.id}
                onClick={() => {
                  setSelectedInfluencerId(selectedInfluencerId === inf.id ? null : inf.id);
                  document.getElementById(`influencer-map-${inf.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                style={{
                  flex: '0 0 auto',
                  padding: '10px 18px',
                  borderRadius: '100px',
                  background: selectedInfluencerId === inf.id ? inf.color : '#fff',
                  color: selectedInfluencerId === inf.id ? '#fff' : '#475569',
                  border: `1px solid ${selectedInfluencerId === inf.id ? inf.color : '#e2e8f0'}`,
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedInfluencerId === inf.id ? `0 4px 12px ${inf.color}44` : 'none'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedInfluencerId === inf.id ? '#fff' : inf.color }} />
                {inf.label}
              </button>
            ))}
          </div>

          {/* Mind Map Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '24px' 
          }}>
            {groupedData.map(data => (
              <div key={data.influencer.id} id={`influencer-map-${data.influencer.id}`}>
                <InfluencerMindMap 
                  {...data} 
                  isSelected={selectedInfluencerId === data.influencer.id}
                  onExpand={() => setExpandedInfluencerId(data.influencer.id)}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Full View Mode */
        <div style={{ animation: 'cardEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <style>{`
            @keyframes cardEnter { 
              from { opacity: 0; transform: scale(0.95) translateY(30px); filter: blur(4px); } 
              to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } 
            }
          `}</style>
          {expandedData && (
            <InfluencerMindMap 
              {...expandedData} 
              isExpanded={true} 
              onBack={() => setExpandedInfluencerId(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
