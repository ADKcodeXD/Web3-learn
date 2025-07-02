// 合约地址 - 需要部署后替换为实际地址
export const BALLOT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
export const PAYMENT_CONTRACT_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
// 支持的网络
export const SUPPORTED_NETWORKS = {
  hardhat: {
    chainId: 1337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  },
}
