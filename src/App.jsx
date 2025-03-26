import { useState } from "react";
import { connectWallet, depositFunds, sendFunds, getBalance } from "./blockchain";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const handleConnect = async () => {
    const signer = await connectWallet();
    if (signer) {
      setWallet(await signer.getAddress());
      toast.success("Wallet Connected!");
    }
  };
  const handleDeposit = async () => {
    if (!amount) return toast.error("Enter an amount!");
    await depositFunds(amount);
    toast.success("Funds Deposited!");
  };
  const handleSend = async () => {
    if (!recipient || !amount) return toast.error("Enter recipient and amount!");
    await sendFunds(recipient, amount);
    toast.success("Transaction Successful!");
  };

  const fetchBalance = async () => {
    if (!wallet) return;
    const bal = await getBalance(wallet);
    setBalance(bal);
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">QShieldChain</div>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="container">
        <h2>Quantum-Secure Blockchain</h2>

        {/* Wallet Connection */}
        {!wallet ? (
          <button onClick={handleConnect} className="btn connect-btn">
            Connect Wallet
          </button>
        ) : (
          <>
            <p className="wallet-address">Connected Wallet: <span>{wallet}</span></p>
            <p className="balance">Balance: {balance} ETH</p>
            <button onClick={fetchBalance} className="btn refresh-btn">
              Refresh Balance
            </button>
          </>
        )}

        {/* Deposit Section */}
        <div className="input-group">
          <input
            type="text"
            placeholder="Amount (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleDeposit} className="btn deposit-btn">
            Deposit
          </button>
        </div>

        {/* Send Funds Section */}
        <div className="input-group">
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <button onClick={handleSend} className="btn send-btn">
            Send
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
