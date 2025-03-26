import Web3 from 'web3';

let web3;

// Initialize Web3
const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      return web3;
    } catch (error) {
      console.error("User denied account access");
      throw error;
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    return web3;
  } else {
    throw new Error("Please install MetaMask to use this application");
  }
};

// Connect to Ethereum using Metamask
export const connectWallet = async () => {
  try {
    web3 = await initWeb3();
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const chainId = await web3.eth.getChainId();

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        return null;
      }
      return accounts[0];
    });

    // Listen for chain changes
    window.ethereum.on('chainChanged', (chainId) => {
      // Reload the page on chain change
      window.location.reload();
    });

    return {
      address: account,
      chainId: chainId
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

export const getBalance = async (address) => {
  try {
    if (!web3) {
      web3 = await initWeb3();
    }

    const balance = await web3.eth.getBalance(address);
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    return balanceInEth;
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

export const sendFunds = async (recipient, amount) => {
  try {
    if (!web3) {
      web3 = await initWeb3();
    }

    const accounts = await web3.eth.getAccounts();
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

    const transaction = await web3.eth.sendTransaction({
      from: accounts[0],
      to: recipient,
      value: amountInWei
    });

    return transaction;
  } catch (error) {
    console.error("Error sending funds:", error);
    throw error;
  }
};

export const depositFunds = async (amount) => {
  try {
    if (!web3) {
      web3 = await initWeb3();
    }

    const accounts = await web3.eth.getAccounts();
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

    const transaction = await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[0], // Sending to self as deposit
      value: amountInWei
    });

    return transaction;
  } catch (error) {
    console.error("Error depositing funds:", error);
    throw error;
  }
}; 