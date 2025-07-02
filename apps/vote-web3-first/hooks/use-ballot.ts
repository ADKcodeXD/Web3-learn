'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { BALLOT_ABI } from '@/lib/contract/ballot.abi'
import { BALLOT_CONTRACT_ADDRESS } from '@/lib/contract/const'
import { useWallet } from './use-wallet'

interface Proposal {
  name: string
  voteCount: number
  index: number
}

interface Voter {
  voted: boolean
  vote: number
}

// 定义错误类型以替换 any
interface ContractError extends Error {
  reason?: string
  code?: string
}

export function useBallot() {
  const {
    provider,
    signer,
    account,
    isConnected,
    networkInfo,
    switchToLocalNetwork,
    getContract,
    checkContractExists,
    connectWallet: walletConnect,
    isLoading: walletLoading,
  } = useWallet()

  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [voterInfo, setVoterInfo] = useState<Voter | null>(null)

  // 连接钱包并确保使用 hardhat 网络
  const connectWallet = async () => {
    const success = await walletConnect('hardhat')
    return success
  }

  // 初始化合约
  useEffect(() => {
    if (signer && isConnected) {
      try {
        const contractInstance = getContract(BALLOT_CONTRACT_ADDRESS, BALLOT_ABI)
        setContract(contractInstance)
        console.log('合约实例已创建')
      } catch (error) {
        console.error('创建合约实例失败:', error)
        setContract(null)
      }
    } else {
      setContract(null)
    }
  }, [signer, isConnected, getContract])

  // 加载合约数据
  const loadContractData = async (contractInstance?: ethers.Contract) => {
    const contractToUse = contractInstance || contract
    if (!contractToUse || !provider) return

    try {
      setIsLoading(true)
      console.log('正在加载合约数据...')
      console.log('合约地址:', BALLOT_CONTRACT_ADDRESS)

      // 检查合约是否存在
      const contractExists = await checkContractExists(BALLOT_CONTRACT_ADDRESS)
      if (!contractExists) {
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
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`加载数据失败: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 投票
  const vote = async (proposalIndex: number) => {
    if (!contract) return
    try {
      setIsLoading(true)
      const tx = await contract.vote(proposalIndex)
      await tx.wait()
      await loadContractData()
      alert('投票成功!')
    } catch (error) {
      const contractError = error as ContractError
      console.error('投票失败:', contractError)
      alert(`投票失败: ${contractError.reason || contractError.message}`)
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

  // 当合约或账户变化时重新加载数据
  useEffect(() => {
    if (contract && account) {
      loadContractData()
    }
  }, [contract, account])

  return {
    // 从 useWallet 继承的状态和方法
    account,
    isConnected,
    networkInfo,

    // 合并的加载状态
    isLoading: walletLoading || isLoading,

    // 投票相关的状态
    proposals,
    voterInfo,
    canVote,

    // 方法
    connectWallet,
    vote,
    getWinner,
    loadContractData,
    switchToLocalNetwork,
  }
}
