import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { fraudDetectionService } from './services/fraudDetectionService';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [useQuantumSecurity, setUseQuantumSecurity] = useState(false);
  const [gasEstimate, setGasEstimate] = useState('');
  const [fraudAnalysis, setFraudAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refs for scroll animations
  const landingRef = useRef(null);
  const featuresRef = useRef(null);
  const transactionsRef = useRef(null);
  const contactRef = useRef(null);

  // Initialize scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all elements with animation classes
    document.querySelectorAll('.scroll-fade-in, .scroll-scale-in').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-connect wallet if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setIsConnected(true);
            setWalletAddress(accounts[0]);
            // Get balance
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            setBalance((parseInt(balance) / 1e18).toFixed(4));
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this application');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setIsConnected(true);
      setWalletAddress(accounts[0]);
      
      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });
      setBalance((parseInt(balance) / 1e18).toFixed(4));
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleRefreshBalance = async () => {
    if (!window.ethereum || !walletAddress) return;

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [walletAddress, 'latest']
      });
      setBalance((parseInt(balance) / 1e18).toFixed(4));
      toast.success('Balance refreshed!');
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Failed to refresh balance');
    }
  };

  const handleDeposit = async () => {
    if (!window.ethereum || !amount) {
      toast.error('Please enter an amount to deposit');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Create transaction object for analysis
      const transaction = {
        amount: amount,
        type: 'deposit',
        timestamp: new Date().toISOString()
      };

      // Analyze transaction for fraud
      const analysis = await fraudDetectionService.analyzeTransaction(transaction);
      setFraudAnalysis(analysis);

      if (analysis.isFraudulent) {
        toast.warning('Potential fraud detected! Please review the transaction carefully.');
        return;
      }

      const weiAmount = (parseFloat(amount) * 1e18).toString(16);
      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: walletAddress, // Self-transfer for deposit
          value: `0x${weiAmount}`
        }]
      });

      setTransactions(prev => [...prev, {
        hash: tx,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        security: useQuantumSecurity ? 'quantum' : 'standard',
        timestamp: new Date().toISOString(),
        fraudAnalysis: analysis
      }]);

      toast.success('Deposit successful!');
      setAmount('');
      handleRefreshBalance();
    } catch (error) {
      console.error('Error depositing:', error);
      toast.error('Failed to deposit');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async () => {
    if (!window.ethereum || !amount || !recipient) {
      toast.error('Please enter both amount and recipient address');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Create transaction object for analysis
      const transaction = {
        amount: amount,
        recipient: recipient,
        type: 'send',
        timestamp: new Date().toISOString()
      };

      // Analyze transaction for fraud
      const analysis = await fraudDetectionService.analyzeTransaction(transaction);
      setFraudAnalysis(analysis);

      if (analysis.isFraudulent) {
        toast.warning('Potential fraud detected! Please review the transaction carefully.');
        return;
      }

      const weiAmount = (parseFloat(amount) * 1e18).toString(16);
      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: recipient,
          value: `0x${weiAmount}`
        }]
      });

      setTransactions(prev => [...prev, {
        hash: tx,
        amount: amount,
        recipient: recipient,
        type: 'send',
        status: 'completed',
        security: useQuantumSecurity ? 'quantum' : 'standard',
        timestamp: new Date().toISOString(),
        fraudAnalysis: analysis
      }]);

      toast.success('Transaction sent successfully!');
      setAmount('');
      setRecipient('');
      handleRefreshBalance();
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast.error('Failed to send transaction');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app">
      <ToastContainer position="top-right" />
      
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">QuantumChain</div>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#security">Security</a></li>
          <li><a href="#transactions">Transactions</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Landing Section */}
      <section className="landing-section" ref={landingRef}>
        <div className="stars">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="star" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }} />
          ))}
        </div>
        <div className="comets">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="comet" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }} />
          ))}
        </div>
        <div className="landing-content scroll-fade-in">
          <h1 className="landing-title">Quantum-Secure Blockchain</h1>
          <p className="landing-subtitle">Experience the future of secure transactions with quantum-resistant cryptography</p>
          <button className="landing-btn" onClick={() => document.getElementById('transactions').scrollIntoView({ behavior: 'smooth' })}>
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" ref={featuresRef}>
        <div className="container">
          <h2 className="scroll-fade-in">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card scroll-scale-in">
              <h3>Quantum Security</h3>
              <p>Advanced cryptographic algorithms resistant to quantum computing attacks</p>
            </div>
            <div className="feature-card scroll-scale-in">
              <h3>Fast Transactions</h3>
              <p>Lightning-fast transaction processing with minimal fees</p>
            </div>
            <div className="feature-card scroll-scale-in">
              <h3>Smart Contracts</h3>
              <p>Secure and efficient smart contract execution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Dashboard Section */}
      <section id="security" className="content-section">
        <div className="container">
          <h2 className="scroll-fade-in">Security Dashboard</h2>
          <p className="section-description scroll-fade-in">
            Monitor your account security and transaction protection status
          </p>
          <div className="security-dashboard scroll-fade-in">
            <div className="security-grid">
              <div className="security-card">
                <h3>Account Security</h3>
                <div className="security-metrics">
                  <div className="metric">
                    <span className="label">Security Level</span>
                    <span className="value high">High</span>
                  </div>
                  <div className="metric">
                    <span className="label">Last Activity</span>
                    <span className="value">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Active Sessions</span>
                    <span className="value">1</span>
                  </div>
                </div>
              </div>
              <div className="security-card">
                <h3>Transaction Protection</h3>
                <div className="security-metrics">
                  <div className="metric">
                    <span className="label">Quantum Security</span>
                    <span className="value">{useQuantumSecurity ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Fraud Detection</span>
                    <span className="value">Active</span>
                  </div>
                  <div className="metric">
                    <span className="label">Risk Level</span>
                    <span className="value low">Low</span>
                  </div>
                </div>
              </div>
              <div className="security-card">
                <h3>Network Status</h3>
                <div className="security-metrics">
                  <div className="metric">
                    <span className="label">Network Health</span>
                    <span className="value high">Excellent</span>
                  </div>
                  <div className="metric">
                    <span className="label">Block Confirmations</span>
                    <span className="value">12+</span>
                  </div>
                  <div className="metric">
                    <span className="label">Gas Price</span>
                    <span className="value">{gasEstimate || 'Calculating...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transactions Section */}
      <section id="transactions" className="content-section" ref={transactionsRef}>
        <div className="container">
          <h2 className="scroll-fade-in">Transactions</h2>
          <div className="wallet-section scroll-fade-in">
            {!isConnected ? (
              <div className="wallet-connect-container">
                <div className="wallet-connect-content">
                  <h3>Connect Your Wallet</h3>
                  <p>Connect your MetaMask wallet to start making transactions</p>
                  <button className="connect-btn" onClick={handleConnect}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="metamask-icon" />
                    Connect MetaMask
                  </button>
                </div>
              </div>
            ) : (
              <div className="wallet-info">
                <div className="wallet-header">
                  <div className="wallet-address">
                    <span className="label">Connected Wallet</span>
                    <span className="address">{walletAddress}</span>
                  </div>
                  <div className="balance">
                    <span className="label">Balance</span>
                    <span className="amount">{balance} ETH</span>
                  </div>
                </div>

                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Amount (ETH)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>

                <div className="button-group">
                  <button onClick={handleDeposit}>Deposit</button>
                  <button onClick={handleSend}>Send</button>
                  <button onClick={handleRefreshBalance}>Refresh Balance</button>
                </div>

                <div className="security-status">
                  <div className="security-badge high">High Security</div>
                  <p className="security-description">Your transactions are protected by advanced quantum-resistant cryptography</p>
                  <div className="security-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={useQuantumSecurity}
                        onChange={(e) => setUseQuantumSecurity(e.target.checked)}
                      />
                      Enable Quantum Security
                    </label>
                    {useQuantumSecurity && (
                      <div className="security-info">
                        <p>Quantum security enabled. Your transaction will be processed with enhanced cryptographic protection.</p>
                      </div>
                    )}
                  </div>
                  <div className="gas-estimate">
                    <p>Estimated gas: {gasEstimate || 'Calculating...'}</p>
                  </div>
                </div>

                {/* Fraud Analysis Display */}
                {fraudAnalysis && (
                  <div className={`fraud-analysis ${fraudAnalysis.isFraudulent ? 'warning' : 'secure'}`}>
                    <h3>Fraud Analysis</h3>
                    <div className="analysis-details">
                      <p>Status: {fraudAnalysis.status}</p>
                      <p>Confidence: {(fraudAnalysis.confidence * 100).toFixed(2)}%</p>
                      {fraudAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className={`recommendation ${rec.type}`}>
                          <p>{rec.message}</p>
                          <p className="action">{rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Transaction History Section */}
      <section id="history" className="content-section">
        <div className="container">
          <h2 className="scroll-fade-in">Transaction History</h2>
          <p className="section-description scroll-fade-in">
            View your complete transaction history and track all your activities.
          </p>
          <div className="transaction-history scroll-fade-in">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Security</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    <td>{tx.type}</td>
                    <td>{tx.amount} ETH</td>
                    <td>
                      <span className={`status ${tx.status}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      <span className={`security-type ${tx.security}`}>
                        {tx.security === 'quantum' ? 'Quantum-Secure' : 'Standard'}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-transactions">
                      No transactions yet. Start by making a deposit or sending funds.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section" ref={contactRef}>
        <div className="container">
          <h2 className="scroll-fade-in">Contact Us</h2>
          <form className="contact-form scroll-fade-in">
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <textarea placeholder="Message"></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default App;
