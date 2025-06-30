'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { BALLOT_ABI, BALLOT_CONTRACT_ADDRESS, SUPPORTED_NETWORKS } from '@/lib/contract'

interface Proposal {
  name: string
  voteCount: number
  index: number
}

interface Voter {
  voted: boolean
  vote: number
}

interface NetworkInfo {
  chainId: number
  name: string
  isSupported: boolean
}

export function useBallot() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [account, setAccount] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [voterInfo, setVoterInfo] = useState<Voter | null>(null)
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)

  // 检测当前网络
  const checkNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      const isHardhatLocal = chainId === SUPPORTED_NETWORKS.hardhat.chainId

      const networkInfo: NetworkInfo = {
        chainId,
        name: isHardhatLocal ? SUPPORTED_NETWORKS.hardhat.name : `Unknown Network (${chainId})`,
        isSupported: isHardhatLocal,
      }

      setNetworkInfo(networkInfo)
      console.log('当前网络:', networkInfo)

      return networkInfo
    } catch (error) {
      console.error('检测网络失败:', error)
      return null
    }
  }

  // 切换到本地 Hardhat 网络
  const switchToLocalNetwork = async () => {
    if (!window.ethereum) return false

    try {
      // 尝试切换到 Hardhat 网络
      await window.ethereum.request!({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SUPPORTED_NETWORKS.hardhat.chainId.toString(16)}` }],
      })
      return true
    } catch (switchError: any) {
      // 如果网络不存在，添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum!.request!({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${SUPPORTED_NETWORKS.hardhat.chainId.toString(16)}`,
                chainName: SUPPORTED_NETWORKS.hardhat.name,
                rpcUrls: [SUPPORTED_NETWORKS.hardhat.rpcUrl],
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

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请安装 MetaMask!')
      return
    }

    try {
      setIsLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum as any)

      // 检测当前网络
      const currentNetwork = await checkNetwork(provider)

      // 如果不是本地网络，尝试切换
      if (!currentNetwork?.isSupported) {
        alert(`当前网络: ${currentNetwork?.name}\n需要切换到 Hardhat Local 网络`)

        const switched = await switchToLocalNetwork()
        if (!switched) {
          alert('请手动切换到 Hardhat Local 网络后重试')
          return
        }

        // 重新检测网络
        await checkNetwork(provider)
      }

      const accounts = await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(BALLOT_CONTRACT_ADDRESS, BALLOT_ABI, signer)

      setProvider(provider)
      setSigner(signer)
      setContract(contract)
      setAccount(accounts[0])
      setIsConnected(true)

      await loadContractData(contract)
    } catch (error) {
      console.error('连接钱包失败:', error)
      alert('连接钱包失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 加载合约数据
  const loadContractData = async (contractInstance?: ethers.Contract) => {
    const contractToUse = contractInstance || contract
    if (!contractToUse) return

    try {
      console.log('正在加载合约数据...')
      console.log('合约地址:', BALLOT_CONTRACT_ADDRESS)

      // 检查合约是否存在
      const code = await provider?.getCode(BALLOT_CONTRACT_ADDRESS)
      if (code === '0x') {
        throw new Error('合约不存在于当前网络，请确认合约地址和网络配置')
      }

      const proposalsData = await contractToUse.getProposals()
      console.log('获取到的提案数据:', proposalsData)

      const proposalsList: Proposal[] = []

      for (let i = 0; i < proposalsData.length; i++) {
        const proposal = proposalsData[i]
        proposalsList.push({
          name: ethers.decodeBytes32String(proposal.name),
          voteCount: Number(proposal.voteCount),
          index: i,
        })
      }

      setProposals(proposalsList)
      console.log('解析后的提案:', proposalsList)

      // 获取当前用户的投票信息
      if (account) {
        const voter = await contractToUse.voters(account)
        setVoterInfo({
          voted: voter.voted,
          vote: Number(voter.vote),
        })
      }
    } catch (error) {
      console.error('加载合约数据失败:', error)
      alert(`加载数据失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 监听网络变化
  useEffect(() => {
    if (!window.ethereum) return

    const handleChainChanged = async (chainId: string) => {
      console.log('网络已切换:', chainId)
      window.location.reload() // 简单重新加载页面
    }

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('账户已切换:', accounts)
      if (accounts.length === 0) {
        // 用户断开连接
        setIsConnected(false)
        setAccount('')
        setProposals([])
        setVoterInfo(null)
      } else {
        // 账户切换，重新连接
        setAccount(accounts[0])
        if (contract) {
          loadContractData()
        }
      }
    }

    if (window.ethereum.on) {
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('accountsChanged', handleAccountsChanged)
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [contract])

  // 投票
  const vote = async (proposalIndex: number) => {
    if (!contract) return
    try {
      setIsLoading(true)
      const tx = await contract.vote(proposalIndex)
      await tx.wait()
      await loadContractData()
      alert('投票成功!')
    } catch (error: any) {
      console.error('投票失败:', error)
      alert(`投票失败: ${error.reason || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 获取获胜提案
  const getWinner = async () => {
    if (!contract) return null

    try {
      const winnerName = await contract.winnerName()
      return ethers.decodeBytes32String(winnerName)
    } catch (error) {
      console.error('获取获胜者失败:', error)
      return null
    }
  }

  // 检查是否可以投票
  const canVote = voterInfo && !voterInfo.voted

  useEffect(() => {
    if (contract && account) {
      loadContractData()
    }
  }, [contract, account])

  return {
    connectWallet,
    vote,
    getWinner,
    loadContractData,
    switchToLocalNetwork,
    isConnected,
    isLoading,
    account,
    proposals,
    voterInfo,
    canVote,
    networkInfo,
  }
}
