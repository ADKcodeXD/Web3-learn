// 网络相关类型
export interface NetworkConfig {
  name: string
  chainId: number
  rpcUrl: string
  blockExplorer?: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

// 合约相关类型
export interface ContractConfig {
  address: string
  abi: any[]
  networkId: number
}

// 代币相关类型
export interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI?: string
  chainId: number
}

// 交易相关类型
export interface TransactionRequest {
  to?: string
  value?: string
  data?: string
  gasLimit?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
}

export interface TransactionResponse {
  hash: string
  blockNumber?: number
  blockHash?: string
  timestamp?: number
  confirmations: number
  from: string
  to?: string
  value: string
  gasUsed?: string
  gasPrice?: string
  status?: number
}

// 钱包相关类型
export interface WalletState {
  isConnected: boolean
  address?: string
  chainId?: number
  provider?: any
}

// DeFi 相关类型
export interface LiquidityPool {
  id: string
  token0: TokenInfo
  token1: TokenInfo
  reserve0: string
  reserve1: string
  totalSupply: string
  fee: number
}

export interface SwapQuote {
  amountIn: string
  amountOut: string
  path: string[]
  priceImpact: string
  slippage: string
  gasEstimate: string
}

// 错误类型
export interface Web3Error {
  code: number
  message: string
  data?: any
}

// 事件类型
export interface ContractEvent {
  address: string
  blockNumber: number
  blockHash: string
  transactionHash: string
  transactionIndex: number
  logIndex: number
  event: string
  args: any
}

// 导出常用枚举
export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum WalletType {
  METAMASK = 'metamask',
  WALLET_CONNECT = 'walletconnect',
  COINBASE = 'coinbase',
}
