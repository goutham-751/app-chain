import { useState, useEffect, useRef } from "react";
import { connectWallet, depositFunds, sendFunds, getBalance } from "./blockchain";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Deposit", amount: "0.5 ETH", date: "2024-03-20 14:30", status: "Completed" },
    { id: 2, type: "Send", amount: "0.2 ETH", date: "2024-03-20 15:45", status: "Completed" },
    { id: 3, type: "Receive", amount: "0.1 ETH", date: "2024-03-20 16:15", status: "Completed" },
  ]);

  // Add refs for scroll animations
  const featureCardsRef = useRef([]);
  const transactionHistoryRef = useRef(null);
  const contentRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe feature cards
    featureCardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    // Observe transaction history
    if (transactionHistoryRef.current) {
      observer.observe(transactionHistoryRef.current);
    }

    // Observe content sections
    contentRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleConnect = async () => {
    try {
      const walletInfo = await connectWallet();
      if (walletInfo && walletInfo.address) {
        setWallet(walletInfo);
        const balance = await getBalance(walletInfo.address);
        setBalance(balance);
        toast.success("Wallet connected successfully!");
      } else {
        toast.error("Failed to connect wallet");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  // Add auto-connect on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const walletInfo = await connectWallet();
            setWallet(walletInfo);
            const balance = await getBalance(walletInfo.address);
            setBalance(balance);
          }
        } catch (error) {
          console.error("Auto-connect error:", error);
        }
      }
    };

    checkConnection();
  }, []);

  const handleDeposit = async () => {
    try {
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      await depositFunds(amount);
      toast.success("Deposit successful!");
      const newBalance = await getBalance(wallet.address);
      setBalance(newBalance);
    } catch (error) {
      toast.error(error.message || "Failed to deposit funds");
    }
  };

  const handleSend = async () => {
    try {
      if (!amount || amount <= 0 || !recipient) {
        toast.error("Please enter valid amount and recipient address");
        return;
      }
      await sendFunds(recipient, amount);
      toast.success("Transfer successful!");
      const newBalance = await getBalance(wallet.address);
      setBalance(newBalance);
    } catch (error) {
      toast.error(error.message || "Failed to send funds");
    }
  };

  const handleRefresh = async () => {
    try {
      const newBalance = await getBalance(wallet.address);
      setBalance(newBalance);
      toast.success("Balance refreshed!");
    } catch (error) {
      toast.error(error.message || "Failed to refresh balance");
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="app">
      {/* Global Starry Background */}
      <div className="stars-container">
        <div className="stars">
          {/* Generate 30 stars */}
          {[...Array(30)].map((_, i) => (
            <div key={i} className="star"></div>
          ))}
        </div>
        <div className="comets">
          {/* Generate 8 comets */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="comet"></div>
          ))}
        </div>
        <div className="shooting-stars">
          {/* Generate 5 shooting stars */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shooting-star"></div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="logo">QShieldChain</div>
        <ul>
          <li><a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}
            className={activeSection === "home" ? "active" : ""}
          >Home</a></li>
          <li><a 
            href="#transactions" 
            onClick={(e) => { e.preventDefault(); scrollToSection("transactions"); }}
            className={activeSection === "transactions" ? "active" : ""}
          >Transactions</a></li>
          <li><a 
            href="#history" 
            onClick={(e) => { e.preventDefault(); scrollToSection("history"); }}
            className={activeSection === "history" ? "active" : ""}
          >Transaction History</a></li>
          <li><a 
            href="#features" 
            onClick={(e) => { e.preventDefault(); scrollToSection("features"); }}
            className={activeSection === "features" ? "active" : ""}
          >Features</a></li>
          <li><a 
            href="#contact" 
            onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}
            className={activeSection === "contact" ? "active" : ""}
          >Contact</a></li>
        </ul>
      </nav>

      {/* Landing Section */}
      <section id="home" className="landing-section">
        {/* Stars */}
        <div className="stars">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
        </div>

        {/* Comets */}
        <div className="comets">
          <div className="comet"></div>
          <div className="comet"></div>
          <div className="comet"></div>
          <div className="comet"></div>
        </div>

        <div className="landing-content">
          <h1 className="landing-title">QShieldChain</h1>
          <p className="landing-subtitle">The Future of Quantum-Secure Blockchain</p>
          <button onClick={handleConnect} className="btn connect-btn landing-btn">
            Get Started
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section id="transactions" className="content-section">
        <div className="container">
          <div ref={el => contentRefs.current[0] = el} className="scroll-fade-in">
            <h2>Quantum-Secure Blockchain</h2>
            <p style={{ 
              fontSize: "21px", 
              color: "#86868b", 
              marginBottom: "30px"
            }}>
              Experience the future of secure transactions with quantum-resistant technology.
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="wallet-section">
            {!wallet ? (
              <div className="wallet-connect-container">
                <div className="wallet-connect-content">
                  <h3>Connect Your Wallet</h3>
                  <p>Connect your MetaMask wallet to start making transactions</p>
                  <button onClick={handleConnect} className="connect-btn">
                    <img src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png" alt="MetaMask" className="metamask-icon" />
                    Connect MetaMask
                  </button>
                </div>
              </div>
            ) : (
              <div className="wallet-info">
                <div className="wallet-header">
                  <div className="wallet-address">
                    <span className="label">Connected Wallet:</span>
                    <span className="address">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                  </div>
                  <div className="balance">
                    <span className="label">Balance:</span>
                    <span className="amount">{balance} ETH</span>
                  </div>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Amount in ETH"
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
                  <button onClick={handleDeposit} className="deposit-btn">
                    Deposit
                  </button>
                  <button onClick={handleSend} className="send-btn">
                    Send
                  </button>
                  <button onClick={handleRefresh} className="refresh-btn">
                    Refresh Balance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Transaction History Section */}
      <section id="history" className="content-section">
        <div className="container">
          <div ref={el => contentRefs.current[1] = el} className="scroll-fade-in">
            <h2>Transaction History</h2>
            <p style={{ 
              fontSize: "21px", 
              color: "#86868b", 
              marginBottom: "30px"
            }}>
              View your complete transaction history and track all your activities.
            </p>
          </div>

          <div ref={transactionHistoryRef} className="transaction-history">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td>{tx.type}</td>
                    <td>{tx.amount}</td>
                    <td>
                      <span className={`status ${tx.status.toLowerCase()}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div ref={el => contentRefs.current[2] = el} className="scroll-fade-in">
            <h2>Features</h2>
            <p style={{ 
              fontSize: "21px", 
              color: "#86868b", 
              marginBottom: "30px"
            }}>
              Discover the power of quantum-secure blockchain technology.
            </p>
          </div>
          <div className="features-grid">
            <div ref={el => featureCardsRef.current[0] = el} className="feature-card scroll-scale-in">
              <h3>Quantum Security</h3>
              <p>Advanced quantum-resistant algorithms protecting your transactions</p>
            </div>
            <div ref={el => featureCardsRef.current[1] = el} className="feature-card scroll-scale-in">
              <h3>Lightning Fast</h3>
              <p>Near-instant transactions with minimal fees</p>
            </div>
            <div ref={el => featureCardsRef.current[2] = el} className="feature-card scroll-scale-in">
              <h3>Decentralized</h3>
              <p>True decentralization with no central authority</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div ref={el => contentRefs.current[3] = el} className="scroll-fade-in">
            <h2>Contact Us</h2>
            <p>Get in touch with our team for any questions or support</p>
          </div>
          <div className="contact-form scroll-slide-up">
            <input type="email" placeholder="Your email" />
            <textarea placeholder="Your message"></textarea>
            <button className="btn send-btn">Send Message</button>
          </div>
        </div>
      </section>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
