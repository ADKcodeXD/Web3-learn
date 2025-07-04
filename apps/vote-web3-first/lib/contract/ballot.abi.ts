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
]
