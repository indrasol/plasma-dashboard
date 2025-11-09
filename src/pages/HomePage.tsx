import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleJoinNow = () => {
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <div className="logo-container">
                <img src="/cen_icon-removebg.png" alt="CentroidAI Icon" className="logo-icon" />
                <span className="logo-text">CentroidAI</span>
              </div>
            </div>
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
          </div>
        </nav>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Advanced Donor Intelligence Platform
            </h1>
            <p className="hero-description">
              Harness the power of AI-driven plasma intelligence, deep donor insights, and 
              connected network analytics to transform your plasma donation operations and maximize donor engagement.
            </p>
            <div className="hero-cta">
              <button className="cta-primary" onClick={handleGetStarted}>
                Get Started
              </button>
              <button className="cta-secondary" onClick={handleJoinNow}>
                Join Now
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <img 
              src="/Advanced Donor Platform.png" 
              alt="Advanced Donor Intelligence Platform" 
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="features-header">
            <h2 className="section-title">Platform Capabilities</h2>
            <p className="section-subtitle">
              Discover the powerful features that make our platform the leading choice for donor intelligence
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon plasma-feature">
                🩸
              </div>
              <h3>Plasma Intelligence</h3>
              <p>Advanced AI analysis of plasma donation patterns with predictive modeling and behavioral insights to optimize donation strategies.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon donor-feature">
                👥
              </div>
              <h3>Donor Insights</h3>
              <p>Deep understanding of donor behavior and preferences through comprehensive analytics, segmentation, and personalized engagement strategies.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon network-feature">
                🔗
              </div>
              <h3>Connected Network</h3>
              <p>Real-time donor network visualization and analytics that reveal relationships, influence patterns, and optimization opportunities.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="footer-logo-container">
                <img src="/cen_icon-removebg.png" alt="CentroidAI Icon" className="footer-logo-icon" />
                <span className="footer-logo-text">CentroidAI</span>
              </div>
              <p>Transforming donor intelligence through AI-powered plasma analytics and connected network insights.</p>
            </div>
            <div className="footer-contact">
              <h4 className="contact-title">Contact</h4>
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <span className="contact-text">centroidai@gmail.com</span>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <span className="contact-text">San Francisco Bay Area, CA</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 CentroidAI, LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
