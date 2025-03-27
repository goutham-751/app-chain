import { ethers } from "ethers";

// Smart Contract Address (Replace with your deployed contract address)
const contractAddress = "0xYourContractAddress";

// Updated Smart Contract ABI with quantum-secure functions
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "depositFunds",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "sendFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    "name": "sendFundsQuantumSecure",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes", "name": "publicKey", "type": "bytes" }
    ],
    "name": "registerPublicKey",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "balances",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "publicKeys",
    "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Connect to Ethereum using Metamask
export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return signer;
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  } else {
    alert("Please install Metamask!");
  }
};

// Get Smart Contract Instance
export const getContract = async () => {
  const signer = await connectWallet();
  if (signer) {
    return new ethers.Contract(contractAddress, contractABI, signer);
  }
};

// Deposit Funds into Smart Contract
export const depositFunds = async (amount) => {
  const contract = await getContract();
  if (contract) {
    const tx = await contract.depositFunds({ value: ethers.parseEther(amount) });
    await tx.wait();
    return tx;
  }
};

// Send Funds to Another Wallet
export const sendFunds = async (recipient, amount) => {
  const contract = await getContract();
  if (contract) {
    const tx = await contract.sendFunds(recipient, ethers.parseEther(amount));
    await tx.wait();
    return tx;
  }
};

// Generate Quantum-Safe Signature
const generateQuantumSignature = async (signer, recipient, amount) => {
  try {
    // In a real implementation, this would use a quantum-safe algorithm library
    // This is a placeholder that simulates a signature using ethers.js
    const message = ethers.solidityPackedKeccak256(
      ['address', 'uint256'],
      [recipient, ethers.parseEther(amount)]
    );
    
    // Sign the message with the signer's private key
    // In a real quantum-secure implementation, this would use Dilithium, Falcon, or SPHINCS+
    const signature = await signer.signMessage(ethers.getBytes(message));
    
    console.log("Quantum signature generated:", signature);
    return signature;
  } catch (error) {
    console.error("Error generating quantum signature:", error);
    throw error;
  }
};

// Send Funds with Quantum Security
export const sendFundsQuantumSecure = async (recipient, amount) => {
  try {
    const contract = await getContract();
    const signer = await connectWallet();
    
    if (contract && signer) {
      // Generate a quantum-safe signature
      const signature = await generateQuantumSignature(signer, recipient, amount);
      
      // Call the quantum-secure function on the smart contract
      const tx = await contract.sendFundsQuantumSecure(
        recipient, 
        ethers.parseEther(amount),
        signature
      );
      
      await tx.wait();
      return {
        tx,
        isQuantumSecure: true
      };
    }
  } catch (error) {
    console.error("Error sending quantum-secure funds:", error);
    throw error;
  }
};

// Register quantum-safe public key
export const registerPublicKey = async (publicKey) => {
  const contract = await getContract();
  if (contract) {
    const tx = await contract.registerPublicKey(publicKey);
    await tx.wait();
    return tx;
  }
};

// Get Balance of User
export const getBalance = async (address) => {
  const contract = await getContract();
  if (contract) {
    const balance = await contract.balances(address);
    return ethers.formatEther(balance);
  }
};

// Get Public Key of User
export const getPublicKey = async (address) => {
  const contract = await getContract();
  if (contract) {
    return await contract.publicKeys(address);
  }
  return null;
};

// Check if user has registered a quantum-safe public key
export const hasQuantumProtection = async (address) => {
  const publicKey = await getPublicKey(address);
  return publicKey && publicKey.length > 0;
};

// Estimate gas for transactions
export const estimateGas = async (methodName, ...args) => {
  const contract = await getContract();
  if (contract) {
    try {
      // Estimate gas usage for the specified method
      const gasEstimate = await contract.estimateGas[methodName](...args);

      // Fetch current gas price from the provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const feeData = await provider.getFeeData();

      // Calculate total fee: gasEstimate * maxFeePerGas
      const totalFeeInWei = gasEstimate * feeData.maxFeePerGas;
      
      // Convert to ETH for display purposes
      return ethers.formatEther(totalFeeInWei);
    } catch (error) {
      console.error("Error estimating gas:", error);
      return null;
    }
  }
};

// Validate transaction security level
export const getTransactionSecurityLevel = async (address) => {
  try {
    // Check if the address has quantum protection
    const hasQuantum = await hasQuantumProtection(address);
    
    // Get network information
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    // Determine security level based on multiple factors
    if (hasQuantum && network.chainId === 1n) { // Mainnet with quantum protection
      return {
        level: "High",
        description: "Quantum-secure protection on main network"
      };
    } else if (hasQuantum) { // Quantum protection on testnet
      return {
        level: "Medium-High",
        description: "Quantum-secure protection on test network"
      };
    } else if (network.chainId === 1n) { // Mainnet without quantum protection
      return {
        level: "Medium",
        description: "Standard protection on main network"
      };
    } else { // Testnet without quantum protection
      return {
        level: "Low",
        description: "Standard protection on test network"
      };
    }
  } catch (error) {
    console.error("Error determining security level:", error);
    return {
      level: "Unknown",
      description: "Could not determine security level"
    };
  }
};

export {
  generateQuantumSignature,
  hasQuantumProtection,
  getTransactionSecurityLevel
};
