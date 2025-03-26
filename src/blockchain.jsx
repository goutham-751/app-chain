import { ethers } from "ethers";

// Smart Contract Address (Replace with your deployed contract address)
const contractAddress = "0xYourContractAddress";

// Smart Contract ABI (Replace with your contract's ABI)
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
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "balances",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
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

// Get Balance of User
export const getBalance = async (address) => {
  const contract = await getContract();
  if (contract) {
    const balance = await contract.balances(address);
    return ethers.formatEther(balance);
  }
};
