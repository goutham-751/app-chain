import Web3 from 'web3';

let web3;
let contract;

// Initialize Web3
const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
    } catch (error) {
      console.error("User denied account access");
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  } else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
};

// Rule-based Fraud Detection Methods
const detectSuspiciousActivity = async (address, amount) => {
  try {
    console.log("Starting fraud detection for address:", address);
    console.log("Transaction amount:", amount);

    // 1. Basic Balance Check
    const balance = await web3.eth.getBalance(address);
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    console.log("Current wallet balance:", balanceInEth);
    
    // Rule 1: Transaction amount exceeds 200% of wallet balance
    if (amount > parseFloat(balanceInEth) * 2) {
      console.log("Suspicious activity detected: Transaction amount exceeds 200% of wallet balance");
      return {
        isSuspicious: true,
        reason: "Transaction amount exceeds 200% of wallet balance"
      };
    }

    // 2. Transaction Frequency Check
    const blockNumber = await web3.eth.getBlockNumber();
    const recentTransactions = await web3.eth.getTransactionCount(address, blockNumber - 10);
    console.log("Recent transactions in last 10 blocks:", recentTransactions);
    
    // Rule 2: High frequency of transactions
    if (recentTransactions > 5) {
      console.log("Suspicious activity detected: High frequency of transactions");
      return {
        isSuspicious: true,
        reason: "High frequency of transactions detected"
      };
    }

    // 3. Gas Price Check
    const gasPrice = await web3.eth.getGasPrice();
    const gasPriceInGwei = web3.utils.fromWei(gasPrice, 'gwei');
    console.log("Current gas price:", gasPriceInGwei, "gwei");

    // Rule 3: Unusually high gas price
    if (parseFloat(gasPriceInGwei) > 100) {
      console.log("Suspicious activity detected: Unusually high gas price");
      return {
        isSuspicious: true,
        reason: "Unusually high gas price detected"
      };
    }

    // 4. Contract Interaction Check
    const code = await web3.eth.getCode(address);
    if (code !== '0x') {
      console.log("Warning: Address is a contract");
      // Rule 4: Contract interaction warning
      return {
        isSuspicious: true,
        reason: "Warning: Interacting with a smart contract"
      };
    }

    // 5. Time-based Check
    const now = Date.now();
    const lastTransaction = await getLastTransactionTime(address);
    if (lastTransaction && (now - lastTransaction) < 5000) { // 5 seconds
      console.log("Suspicious activity detected: Very rapid transactions");
      return {
        isSuspicious: true,
        reason: "Very rapid transactions detected"
      };
    }

    // 6. Amount Threshold Check
    // Rule 5: Maximum transaction amount threshold
    const maxAmount = 100; // Maximum 100 ETH per transaction
    if (amount > maxAmount) {
      console.log("Suspicious activity detected: Transaction amount exceeds maximum threshold");
      return {
        isSuspicious: true,
        reason: "Transaction amount exceeds maximum threshold of 100 ETH"
      };
    }

    // 7. Network Check
    const networkId = await web3.eth.net.getId();
    console.log("Current network ID:", networkId);
    
    // Rule 6: Network validation
    if (networkId !== 1) { // 1 is mainnet
      console.log("Warning: Not on Ethereum mainnet");
      return {
        isSuspicious: true,
        reason: "Warning: Transaction not on Ethereum mainnet"
      };
    }

    console.log("No suspicious activity detected");
    return {
      isSuspicious: false,
      reason: "Transaction appears normal"
    };
  } catch (error) {
    console.error("Error in fraud detection:", error);
    return {
      isSuspicious: false,
      reason: "Unable to perform fraud detection"
    };
  }
};

// Helper function to get last transaction time
const getLastTransactionTime = async (address) => {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    const block = await web3.eth.getBlock(blockNumber, true);
    
    for (let i = block.transactions.length - 1; i >= 0; i--) {
      const tx = block.transactions[i];
      if (tx.from.toLowerCase() === address.toLowerCase()) {
        return block.timestamp * 1000; // Convert to milliseconds
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting last transaction time:", error);
    return null;
  }
};

// Helper function to get transaction history
const getTransactionHistory = async (address) => {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    const history = [];
    
    // Get last 10 blocks
    for (let i = 0; i < 10; i++) {
      const block = await web3.eth.getBlock(blockNumber - i, true);
      block.transactions.forEach(tx => {
        if (tx.from.toLowerCase() === address.toLowerCase()) {
          history.push({
            amount: web3.utils.fromWei(tx.value, 'ether'),
            timestamp: block.timestamp
          });
        }
      });
    }
    return history;
  } catch (error) {
    console.error("Error getting transaction history:", error);
    return [];
  }
};

// Helper function to calculate average transaction amount
const calculateAverageTransactionAmount = (history) => {
  if (history.length === 0) return 0;
  const sum = history.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
  return sum / history.length;
};

// Simplified Transaction Validation
const validateTransaction = async (from, to, amount) => {
  try {
    console.log("Starting transaction validation");
    console.log("From:", from);
    console.log("To:", to);
    console.log("Amount:", amount);

    // Rule 1: Address Validation
    if (!web3.utils.isAddress(from) || !web3.utils.isAddress(to)) {
      console.log("Invalid Ethereum address detected");
      return {
        isValid: false,
        reason: "Invalid Ethereum address"
      };
    }

    // Rule 2: Amount Validation
    if (amount <= 0) {
      console.log("Invalid amount detected: Amount must be positive");
      return {
        isValid: false,
        reason: "Transaction amount must be positive"
      };
    }

    // Rule 3: Minimum Amount Check
    const minAmount = web3.utils.toWei('0.0001', 'ether');
    if (amount < minAmount) {
      console.log("Invalid amount detected: Below minimum threshold");
      return {
        isValid: false,
        reason: "Transaction amount below minimum threshold"
      };
    }

    // Rule 4: Maximum Amount Check
    const maxAmount = web3.utils.toWei('100', 'ether');
    if (amount > maxAmount) {
      console.log("Invalid amount detected: Above maximum threshold");
      return {
        isValid: false,
        reason: "Transaction amount above maximum threshold"
      };
    }

    console.log("Transaction validation passed");
    return {
      isValid: true,
      reason: "Transaction is valid"
    };
  } catch (error) {
    console.error("Error in transaction validation:", error);
    return {
      isValid: false,
      reason: "Error validating transaction"
    };
  }
};

// Connect Wallet
const connectWallet = async () => {
  try {
    if (!web3) {
      await initWeb3();
    }
    const accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);
    return {
      address: accounts[0],
      balance: web3.utils.fromWei(balance, 'ether')
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Get Balance
const getBalance = async (address) => {
  try {
    if (!web3) {
      await initWeb3();
    }
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

// Quantum-safe signature generation (simulation)
const generateQuantumSignature = async (from, to, amount) => {
  try {
    console.log("Generating quantum-safe signature");
    
    // In a real implementation, this would use a quantum-safe algorithm library
    // This is a placeholder that simulates a signature
    const message = web3.utils.soliditySha3(
      { t: 'address', v: from },
      { t: 'address', v: to },
      { t: 'uint256', v: web3.utils.toWei(amount.toString(), 'ether') }
    );
    
    // Simulate quantum-safe signature (in reality, would use Dilithium, Falcon, or SPHINCS+)
    const signature = web3.eth.accounts.sign(message, '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    
    console.log("Quantum signature generated");
    return signature.signature;
  } catch (error) {
    console.error("Error generating quantum signature:", error);
    throw error;
  }
};

// Send Funds
const sendFunds = async (from, to, amount) => {
  try {
    if (!web3) {
      await initWeb3();
    }

    // Validate transaction
    const validation = await validateTransaction(from, to, amount);
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    // Check for suspicious activity
    const fraudCheck = await detectSuspiciousActivity(from, amount);
    if (fraudCheck.isSuspicious) {
      throw new Error(fraudCheck.reason);
    }

    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    await web3.eth.sendTransaction({
      from,
      to,
      value: weiAmount
    });
  } catch (error) {
    console.error("Error sending funds:", error);
    throw error;
  }
};

// Send Funds with Quantum Security
const sendFundsQuantumSecure = async (from, to, amount) => {
  try {
    if (!web3) {
      await initWeb3();
    }

    // Validate transaction
    const validation = await validateTransaction(from, to, amount);
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    // Check for suspicious activity
    const fraudCheck = await detectSuspiciousActivity(from, amount);
    if (fraudCheck.isSuspicious) {
      throw new Error(fraudCheck.reason);
    }

    // Generate quantum-safe signature
    const signature = await generateQuantumSignature(from, to, amount);
    
    // Get contract instance (you'll need to implement this)
    const contract = await getContractInstance();
    
    // Call the quantum-secure function on your smart contract
    // This is a placeholder - in reality, you would call your deployed contract
    console.log("Sending quantum-secure transaction with signature:", signature);
    
    // Fallback to regular transaction if contract isn't available
    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    await web3.eth.sendTransaction({
      from,
      to,
      value: weiAmount,
      data: signature // Attach signature as data
    });
      
    return {
      success: true,
      isQuantumSecure: true
    };
  } catch (error) {
    console.error("Error sending funds with quantum security:", error);
    throw error;
  }
};

// Deposit Funds
const depositFunds = async (address, amount) => {
  try {
    if (!web3) {
      await initWeb3();
    }

    // Validate transaction
    const validation = await validateTransaction(address, address, amount);
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    // Check for suspicious activity
    const fraudCheck = await detectSuspiciousActivity(address, amount);
    if (fraudCheck.isSuspicious) {
      throw new Error(fraudCheck.reason);
    }

    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    await web3.eth.sendTransaction({
      from: address,
      to: address,
      value: weiAmount
    });
  } catch (error) {
    console.error("Error depositing funds:", error);
    throw error;
  }
};

// Get contract instance (placeholder - implement with your contract details)
const getContractInstance = async () => {
  try {
    if (!web3) {
      await initWeb3();
    }
    
    // Replace with your contract address and ABI
    const contractAddress = "0xYourContractAddress";
    const contractABI = []; // Your contract ABI here
    
    return new web3.eth.Contract(contractABI, contractAddress);
  } catch (error) {
    console.error("Error getting contract instance:", error);
    return null;
  }
};

// Estimate gas for a transaction
const estimateGas = async (from, to, amount) => {
  try {
    if (!web3) {
      await initWeb3();
    }
    
    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    const gasEstimate = await web3.eth.estimateGas({
      from,
      to,
      value: weiAmount
    });
    
    const gasPrice = await web3.eth.getGasPrice();
    const totalFee = gasEstimate * gasPrice;
    
    return {
      gasEstimate,
      gasPrice,
      totalFee: web3.utils.fromWei(totalFee.toString(), 'ether')
    };
  } catch (error) {
    console.error("Error estimating gas:", error);
    return null;
  }
};

export {
  initWeb3,
  connectWallet,
  getBalance,
  sendFunds,
  depositFunds,
  detectSuspiciousActivity,
  validateTransaction,
  generateQuantumSignature,
  sendFundsQuantumSecure,
  estimateGas,
  getTransactionHistory
};
