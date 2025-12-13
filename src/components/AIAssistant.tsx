import { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface SuggestedQuestion {
  icon: React.ReactNode;
  question: string;
  category: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const suggestedQuestions: SuggestedQuestion[] = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      question: 'Which donors are most likely to convert in the next campaign?',
      category: 'Predictions'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      question: 'Show me donors at high risk of churning',
      category: 'Risk Analysis'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
      question: 'Compare conversion rates between email vs SMS campaigns',
      category: 'Analytics'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
          <path d="M12 2v6l4 2-4 2v6"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      question: 'What is the best time to contact donors in Cluster 2?',
      category: 'Recommendations'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
        </svg>
      ),
      question: 'Who are my top influencers this month?',
      category: 'Performance'
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor"/>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
      question: 'Predict donation volumes for next quarter',
      category: 'Forecasting'
    }
  ];

  // Demo responses for showcase
  const getDemoResponse = (question: string): string => {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('convert') || lowerQ.includes('campaign')) {
      return `Based on our AI analysis, here are the top 5 donors most likely to convert:

🥇 **Sarah Johnson** - 94% conversion probability
• Cluster: High Value Donors
• Last donation: 12 days ago
• Preferred channel: Email
• Recommended: Send personalized impact story

🥈 **Michael Chen** - 89% conversion probability
• Cluster: Frequent Contributors
• Last donation: 8 days ago
• Preferred channel: SMS
• Recommended: Time-sensitive incentive offer

🥉 **Emily Rodriguez** - 87% conversion probability
• Cluster: Seasonal Donors
• Last donation: 45 days ago
• Preferred channel: Phone
• Recommended: Personal outreach with gratitude

📋 Would you like me to create a targeted campaign for these donors?`;
    }

    if (lowerQ.includes('churn') || lowerQ.includes('risk')) {
      return `⚠️ **Churn Risk Alert** - 23 donors identified at high risk:

**Critical Risk (85%+):**
• John Smith - Last donation: 67 days ago
• Lisa Wang - Last donation: 72 days ago
• Action: Immediate personalized outreach needed

**High Risk (70-84%):**
• 8 donors in this category
• Average days since last donation: 58
• Recommended: Re-engagement campaign with special incentive

**Medium Risk (50-69%):**
• 13 donors in this category
• Recommended: Regular touchpoint campaign

💡 **AI Recommendation:** Launch a "We Miss You" campaign with personalized messages highlighting their past impact. Optimal send time: Tuesday-Thursday, 10 AM - 2 PM.

Would you like me to draft this campaign?`;
    }

    if (lowerQ.includes('compare') || lowerQ.includes('email') || lowerQ.includes('sms')) {
      return `📊 **Campaign Channel Performance Analysis**

**Email Campaigns:**
• Average Conversion Rate: 12.3%
• Best performing time: Tuesday 10 AM
• Open Rate: 34.5%
• Click-through Rate: 8.2%
• Cost per conversion: $15.20

**SMS Campaigns:**
• Average Conversion Rate: 18.7% ⬆️
• Best performing time: Thursday 2 PM
• Response Rate: 42.1%
• Click-through Rate: 15.3%
• Cost per conversion: $12.80 ⬇️

**Key Insights:**
✅ SMS shows 52% higher conversion rate
✅ SMS has 34% lower cost per acquisition
✅ Email works better for detailed stories
✅ SMS excels at time-sensitive offers

**Recommendation:** Use SMS for urgent campaigns and high-value segments. Reserve email for storytelling and monthly newsletters.`;
    }

    if (lowerQ.includes('cluster 2') || lowerQ.includes('best time')) {
      return `⏰ **Optimal Contact Strategy for Cluster 2**

**Cluster Profile:** "Young Professional Donors"
• Size: 342 donors
• Avg Age: 28-35
• Employment: Full-time professionals

**Best Contact Times:**
🌅 **Morning (8-10 AM):** 15% response rate
🌞 **Lunch (12-1 PM):** 28% response rate ⭐
🌆 **Evening (6-8 PM):** 42% response rate ⭐⭐

**Best Days:**
• Wednesday: 38% response rate
• Thursday: 42% response rate ⭐
• Saturday: 31% response rate

**Channel Preference:**
1. SMS (47% preference)
2. Email (32% preference)
3. Phone (21% preference)

**AI Recommendation:** Schedule campaigns for Thursday 6:30 PM via SMS for maximum engagement.`;
    }

    if (lowerQ.includes('influencer') || lowerQ.includes('top')) {
      return `🏆 **Top Influencers This Month**

🥇 **Dr. Amanda Rivers** - #1 Influencer
• Total Network Reach: 1,247 donors
• Direct Referrals: 34 new donors
• Conversion Rate: 67%
• Total Impact: $42,500 in donations
• Social Engagement: 15.2K interactions

🥈 **Marcus Thompson** - #2 Influencer
• Total Network Reach: 892 donors
• Direct Referrals: 28 new donors
• Conversion Rate: 61%
• Total Impact: $38,900 in donations
• Social Engagement: 12.8K interactions

🥉 **Sofia Martinez** - #3 Influencer
• Total Network Reach: 756 donors
• Direct Referrals: 22 new donors
• Conversion Rate: 59%
• Total Impact: $31,200 in donations
• Social Engagement: 9.4K interactions

**Trend:** Influencers in healthcare professions show 3x higher conversion rates. Consider partnering for social media campaigns.`;
    }

    if (lowerQ.includes('predict') || lowerQ.includes('forecast') || lowerQ.includes('quarter')) {
      return `🔮 **Q2 2025 Donation Volume Forecast**

**Predicted Total Volume:** 2,847,500 mL
**Confidence Interval:** 2,680,000 - 3,015,000 mL
**Expected Growth:** +12.3% vs Q1 2025

**Monthly Breakdown:**
📈 **April:** 920,000 mL (High confidence)
📊 **May:** 960,000 mL (Medium confidence)
📉 **June:** 967,500 mL (Medium confidence)

**Key Factors Influencing Forecast:**
✅ Spring season boost (+8%)
✅ Tax refund season (+5%)
⚠️ Holiday weekends impact (-3%)
⚠️ School schedule changes (-2%)

**Donor Participation Forecast:**
• Expected unique donors: 3,240
• New donors: 420 (+15%)
• Returning donors: 2,820
• Average donation frequency: 1.8x

**Capacity Planning Recommendation:**
• Staff up 15% in April
• Extend hours on Saturdays in May
• Plan mobile collection events for June`;
    }

    // Default response
    return `I'm your AI-powered analytics assistant! I can help you with:

📊 **Data Analysis**
• Donor behavior patterns
• Campaign performance metrics
• Conversion rate analysis

🎯 **Predictions & Forecasts**
• Churn risk assessment
• Donation volume predictions
• Donor conversion likelihood

💡 **Recommendations**
• Optimal campaign strategies
• Best contact times
• Personalized donor engagement

🔍 **Insights**
• Cluster analysis summaries
• Influencer network insights
• Trend identification

Try asking me a specific question, or click one of the suggested questions below!`;
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: getDemoResponse(text),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="ai-assistant-page">
      <div className="ai-header">
        <div className="ai-header-content">
          <div className="ai-header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <circle cx="9" cy="10" r="1" fill="currentColor"/>
              <circle cx="15" cy="10" r="1" fill="currentColor"/>
              <path d="M9 14h6" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="ai-header-title">Ask CAI</h1>
            <p className="ai-header-subtitle">
              Talk to CAI and get instant insights
            </p>
          </div>
        </div>
      </div>

      <div className="ai-container">
        <div className="ai-main-content">
          {/* Chat Messages Area */}
          <div className="ai-chat-container" ref={chatContainerRef}>
            {messages.length === 0 ? (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <circle cx="9" cy="10" r="1" fill="currentColor"/>
                    <circle cx="15" cy="10" r="1" fill="currentColor"/>
                    <path d="M9 14h6" strokeLinecap="round"/>
                  </svg>
                </div>
                <h2 className="ai-welcome-title">Hi! I'm CAI 👋</h2>
                <p className="ai-welcome-text">
                  I'm your AI-powered analytics assistant. I can help you analyze donor data, 
                  predict trends, and optimize campaigns. Ask me anything or choose from the 
                  suggested questions below!
                </p>
              </div>
            ) : (
              <div className="ai-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`ai-message ${msg.type}`}>
                    <div className="ai-message-avatar">
                      {msg.type === 'user' ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                          <path d="M2 17l10 5 10-5"/>
                          <path d="M2 12l10 5 10-5"/>
                        </svg>
                      )}
                    </div>
                    <div className="ai-message-content">
                      <div className="ai-message-label">
                        {msg.type === 'user' ? 'You' : 'CAI'}
                      </div>
                      <div className="ai-message-text">{msg.text}</div>
                      <div className="ai-message-time">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="ai-message ai">
                    <div className="ai-message-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div className="ai-message-content">
                      <div className="ai-message-label">CAI</div>
                      <div className="ai-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="ai-input-container">
            <input
              type="text"
              className="ai-input"
              placeholder="Ask me anything about your donor data..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            />
            <button
              className="ai-send-button"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Suggested Questions Sidebar */}
        <div className="ai-suggestions">
          <div className="ai-suggestions-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h3>Suggested Questions</h3>
          </div>
          <div className="ai-suggestions-list">
            {suggestedQuestions.map((sq, index) => (
              <button
                key={index}
                className="ai-suggestion-card"
                onClick={() => handleQuestionClick(sq.question)}
              >
                <div className="ai-suggestion-icon">{sq.icon}</div>
                <div className="ai-suggestion-content">
                  <div className="ai-suggestion-category">{sq.category}</div>
                  <div className="ai-suggestion-text">{sq.question}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

