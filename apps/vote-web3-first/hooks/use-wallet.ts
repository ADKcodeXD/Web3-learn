'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { SUPPORTED_NETWORKS } from '@/lib/contract/const'

// 定义错误类型
interface EthereumError extends Error {
  code?: number
  reason?: string
}

export interface NetworkInfo {
  chainId: number
  name: string
  isSupported: boolean
}

export interface WalletState {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  account: string
  isConnected: boolean
  isLoading: boolean
  networkInfo: NetworkInfo | null
}

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string>('')
  const [balance, setBalance] = useState<any | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)

  // 检测当前网络
  const checkNetwork = async (providerInstance: ethers.BrowserProvider) => {
    try {
      const network = await providerInstance.getNetwork()
      const chainId = Number(network.chainId)

      const isHardhatLocal = chainId === SUPPORTED_NETWORKS.hardhat.chainId
      const isSepoliaTestnet = chainId === SUPPORTED_NETWORKS.sepolia.chainId

      let networkName = `Unknown Network (${chainId})`
      let isSupported = false

      if (isHardhatLocal) {
        networkName = SUPPORTED_NETWORKS.hardhat.name
        isSupported = true
      } else if (isSepoliaTestnet) {
        networkName = SUPPORTED_NETWORKS.sepolia.name
        isSupported = true
      }

      const networkInfo: NetworkInfo = {
        chainId,
        name: networkName,
        isSupported,
      }

      setNetworkInfo(networkInfo)
      console.log('当前网络:', networkInfo)

      return networkInfo
    } catch (error) {
      console.error('检测网络失败:', error)
      return null
    }
  }

  // 切换到指定网络
  const switchToNetwork = async (networkKey: keyof typeof SUPPORTED_NETWORKS) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum
    if (!ethereum) return false

    const targetNetwork = SUPPORTED_NETWORKS[networkKey]

    try {
      // 尝试切换到指定网络
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetNetwork.chainId.toString(16)}` }],
      })
      return true
    } catch (switchError) {
      const error = switchError as EthereumError
      // 如果网络不存在，添加网络
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetNetwork.chainId.toString(16)}`,
                chainName: targetNetwork.name,
                rpcUrls: [targetNetwork.rpcUrl],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          })
          return true
        } catch (addError) {
          console.error('添加网络失败:', addError)
          return false
        }
      } else {
        console.error('切换网络失败:', switchError)
        return false
      }
    }
  }

  // 切换到本地 Hardhat 网络（保持向后兼容）
  const switchToLocalNetwork = async () => {
    return switchToNetwork('hardhat')
  }

  // 连接钱包
  const connectWallet = async (requiredNetwork?: keyof typeof SUPPORTED_NETWORKS) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      alert('请安装 MetaMask!')
      return false
    }

    try {
      setIsLoading(true)
      const providerInstance = new ethers.BrowserProvider(ethereum)
      const currentNetwork = await checkNetwork(providerInstance)

      // 如果指定了需要的网络且当前网络不符合，尝试切换
      if (requiredNetwork && currentNetwork?.chainId !== SUPPORTED_NETWORKS[requiredNetwork].chainId) {
        const targetNetworkName = SUPPORTED_NETWORKS[requiredNetwork].name
        alert(`当前网络: ${currentNetwork?.name}\n需要切换到 ${targetNetworkName}`)

        const switched = await switchToNetwork(requiredNetwork)
        if (!switched) {
          alert(`请手动切换到 ${targetNetworkName} 后重试`)
          return false
        }

        // 重新检测网络
        await checkNetwork(providerInstance)
      }

      const accounts = await providerInstance.send('eth_requestAccounts', [])
      const balance = await providerInstance.getBalance(accounts[0])
      const etherBalance = ethers.formatEther(balance)
      const signerInstance = await providerInstance.getSigner()

      setProvider(providerInstance)
      setSigner(signerInstance)
      setAccount(accounts[0])
      setBalance(etherBalance)
      setIsConnected(true)

      console.log('钱包连接成功:', accounts[0])
      return true
    } catch (error) {
      console.error('连接钱包失败:', error)
      alert('连接钱包失败')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // 断开钱包连接
  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setAccount('')
    setIsConnected(false)
    setNetworkInfo(null)
    setBalance(null)
    console.log('钱包已断开连接')
  }

  // 获取合约实例
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getContract = (contractAddress: string, abi: any) => {
    if (!signer) {
      throw new Error('钱包未连接')
    }
    return new ethers.Contract(contractAddress, abi, signer)
  }

  // 检查合约是否存在
  const checkContractExists = async (contractAddress: string) => {
    if (!provider) return false

    try {
      const code = await provider.getCode(contractAddress)
      return code !== '0x'
    } catch (error) {
      console.error('检查合约失败:', error)
      return false
    }
  }

  // 监听网络和账户变化
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    const handleChainChanged = async (chainId: string) => {
      console.log('网络已切换:', chainId)
      if (provider) {
        await checkNetwork(provider)
      }
    }

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('账户已切换:', accounts)
      if (accounts.length === 0) {
        // 用户断开连接
        disconnectWallet()
      } else {
        // 账户切换
        setAccount(accounts[0])
      }
    }

    if (ethereum.on) {
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
    }

    return () => {
      if (ethereum && ethereum.removeListener) {
        ethereum.removeListener('chainChanged', handleChainChanged)
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [provider])

  return {
    // 状态
    provider,
    signer,
    account,
    isConnected,
    isLoading,
    networkInfo,
    balance,
    // 方法
    connectWallet,
    disconnectWallet,
    checkNetwork,
    switchToNetwork,
    switchToLocalNetwork,
    getContract,
    checkContractExists,
  }
}
