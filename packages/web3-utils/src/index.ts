import { ethers, formatEther, parseEther, formatUnits, parseUnits } from 'ethers'
import type {
  NetworkConfig,
  TokenInfo,
  TransactionRequest,
  TransactionResponse,
  WalletState,
  SwapQuote,
} from '@repo/web3-types'

// 格式化工具函数
export const formatUtils = {
  // 格式化以太坊地址
  formatAddress: (address: string, startLength = 6, endLength = 4): string => {
    if (!address) return ''
    if (address.length <= startLength + endLength) return address
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
  },

  // 格式化代币数量
  formatTokenAmount: (amount: string | number, decimals = 18, displayDecimals = 4): string => {
    const formatted = formatUnits(amount.toString(), decimals)
    const num = parseFloat(formatted)
    if (num === 0) return '0'
    if (num < Math.pow(10, -displayDecimals)) return `< ${Math.pow(10, -displayDecimals)}`
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals,
    })
  },

  // 格式化 USD 金额
  formatUSD: (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (num === 0) return '$0.00'
    if (num < 0.01) return '< $0.01'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  },

  // 格式化百分比
  formatPercent: (value: number | string, decimals = 2): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return `${num.toFixed(decimals)}%`
  },
}

// 验证工具函数
export const validateUtils = {
  // 验证以太坊地址
  isValidAddress: (address: string): boolean => {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  },

  // 验证私钥
  isValidPrivateKey: (privateKey: string): boolean => {
    try {
      new ethers.Wallet(privateKey)
      return true
    } catch {
      return false
    }
  },

  // 验证交易哈希
  isValidTxHash: (hash: string): boolean => {
    return /^0x[a-fA-F0-9]{64}$/.test(hash)
  },

  // 验证数字输入
  isValidAmount: (amount: string): boolean => {
    try {
      const num = parseFloat(amount)
      return !isNaN(num) && num > 0
    } catch {
      return false
    }
  },
}

// 计算工具函数
export const calculateUtils = {
  // 计算价格影响
  calculatePriceImpact: (
    amountIn: string,
    reserveIn: string,
    reserveOut: string,
    decimalsIn = 18,
    decimalsOut = 18
  ): string => {
    try {
      const amountInBig = parseUnits(amountIn, decimalsIn)
      const reserveInBig = parseUnits(reserveIn, decimalsIn)
      const reserveOutBig = parseUnits(reserveOut, decimalsOut)

      const numerator = amountInBig * reserveOutBig
      const denominator = (reserveInBig + amountInBig) * reserveInBig

      const priceImpact = (numerator / denominator) * 100n
      return formatUnits(priceImpact, decimalsOut)
    } catch {
      return '0'
    }
  },

  // 计算滑点
  calculateSlippage: (expectedAmount: string, actualAmount: string, decimals = 18): string => {
    try {
      const expected = parseUnits(expectedAmount, decimals)
      const actual = parseUnits(actualAmount, decimals)

      const slippage = ((expected - actual) * 100n) / expected
      return formatUnits(slippage, decimals)
    } catch {
      return '0'
    }
  },

  // 计算 LP 代币价值
  calculateLPValue: (
    lpAmount: string,
    totalSupply: string,
    reserve0: string,
    reserve1: string,
    token0Price: string,
    token1Price: string,
    decimals = 18
  ): string => {
    try {
      const lpBig = parseUnits(lpAmount, decimals)
      const totalSupplyBig = parseUnits(totalSupply, decimals)
      const reserve0Big = parseUnits(reserve0, decimals)
      const reserve1Big = parseUnits(reserve1, decimals)
      const price0Big = parseUnits(token0Price, decimals)
      const price1Big = parseUnits(token1Price, decimals)

      const share = lpBig / totalSupplyBig
      const value0 = (reserve0Big * share * price0Big) / BigInt(10 ** decimals)
      const value1 = (reserve1Big * share * price1Big) / BigInt(10 ** decimals)

      return formatUnits(value0 + value1, decimals)
    } catch {
      return '0'
    }
  },
}

// 网络工具函数
export const networkUtils = {
  // 获取网络配置
  getNetworkConfig: (chainId: number): NetworkConfig | null => {
    const networks: Record<number, NetworkConfig> = {
      1: {
        name: 'Ethereum Mainnet',
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/',
        blockExplorer: 'https://etherscan.io',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      },
      11155111: {
        name: 'Sepolia Testnet',
        chainId: 11155111,
        rpcUrl: 'https://sepolia.infura.io/v3/',
        blockExplorer: 'https://sepolia.etherscan.io',
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
      },
      1337: {
        name: 'Hardhat Local',
        chainId: 1337,
        rpcUrl: 'http://127.0.0.1:8545',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      },
    }
    return networks[chainId] || null
  },

  // 检查是否为测试网络
  isTestnet: (chainId: number): boolean => {
    const testnets = [11155111, 1337] // Sepolia, Hardhat
    return testnets.includes(chainId)
  },
}

// 合约工具函数
export const contractUtils = {
  // 获取合约实例
  getContract: (address: string, abi: any[], provider: any) => {
    return new ethers.Contract(address, abi, provider)
  },

  // 编码函数调用
  encodeFunctionCall: (abi: any[], functionName: string, params: any[]): string => {
    const iface = new ethers.Interface(abi)
    return iface.encodeFunctionData(functionName, params)
  },

  // 解码函数调用
  decodeFunctionCall: (abi: any[], data: string): any => {
    const iface = new ethers.Interface(abi)
    return iface.decodeFunctionData(data.slice(0, 10), data)
  },
}

// 导出所有工具函数
export * from './wallet'
export * from './transactions'
export * from './defi'
