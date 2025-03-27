import React, { useState, useEffect } from 'react';
import './SecurityDashboard.css';

const SecurityDashboard = ({ walletAddress }) => {
  const [securityScore, setSecurityScore] = useState(0);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [quantumStatus, setQuantumStatus] = useState('Not Protected');

  useEffect(() => {
    if (walletAddress) {
      // Calculate security score based on various factors
      calculateSecurityScore();
      // Fetch security alerts
      fetchSecurityAlerts();
    }
  }, [walletAddress]);

  const calculateSecurityScore = () => {
    // This would be based on real metrics in production
    // For now, we'll use a random score between 60-95
    const score = Math.floor(Math.random() * 36) + 60;
    setSecurityScore(score);
    
    // Set quantum status based on whether the user has registered a quantum key
    // This would check the blockchain in a real implementation
    setQuantumStatus(Math.random() > 0.5 ? 'Protected' : 'Not Protected');
  };

  const fetchSecurityAlerts = () => {
    // Simulate fetching security alerts
    const mockAlerts = [
      {
        id: 1,
        severity: 'high',
        message: 'Unusual transaction pattern detected',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        severity: 'medium',
        message: 'Multiple failed transaction attempts',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        severity: 'low',
        message: 'New device used for wallet access',
        timestamp: new Date(Date.now() - 259200000).toISOString()
      }
    ];
    
    setSecurityAlerts(mockAlerts);
  };

  return (
    <div className="security-dashboard">
      <h2>Security Dashboard</h2>
      
      <div className="security-score-container">
        <div className="security-score" style={{ 
          background: `conic-gradient(
            ${securityScore > 80 ? '#4CAF50' : securityScore > 60 ? '#FFC107' : '#F44336'} 
            ${securityScore * 3.6}deg, 
            #2c3e50 0deg
          )`
        }}>
          <div className="score-value">{securityScore}</div>
        </div>
        <div className="score-label">Security Score</div>
      </div>
      
      <div className="security-status">
        <div className="status-item">
          <span className="status-label">Quantum Protection:</span>
          <span className={`status-value ${quantumStatus === 'Protected' ? 'protected' : 'not-protected'}`}>
            {quantumStatus}
          </span>
        </div>
      </div>
      
      <div className="security-alerts">
        <h3>Security Alerts</h3>
        {securityAlerts.length > 0 ? (
          <ul>
            {securityAlerts.map(alert => (
              <li key={alert.id} className={`alert-${alert.severity}`}>
                <div className="alert-header">
                  <span className="alert-severity">{alert.severity.toUpperCase()}</span>
                  <span className="alert-time">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="alert-message">{alert.message}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No security alerts found.</p>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;
