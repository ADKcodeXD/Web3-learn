// 投票合约 ABI
export const BALLOT_ABI = [
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'proposalNames',
        type: 'bytes32[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'proposals',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'name',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'voteCount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'proposal',
        type: 'uint256',
      },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'voters',
    outputs: [
      {
        internalType: 'bool',
        name: 'voted',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'vote',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'winnerName',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'winnerName_',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'winningProposal',
    outputs: [
      {
        internalType: 'uint256',
        name: 'winningProposal_',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getProposals',
    outputs: [
      {
        internalType: 'tuple[]',
        name: '',
        type: 'tuple[]',
        components: [
          {
            internalType: 'bytes32',
            name: 'name',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'voteCount',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// 合约地址 - 需要部署后替换为实际地址
export const BALLOT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

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
} as const
