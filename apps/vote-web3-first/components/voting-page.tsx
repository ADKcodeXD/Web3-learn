'use client'

import { useState, useEffect } from 'react'
import { useBallot } from '@/hooks/use-ballot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Wallet, Vote, Users, Trophy, Wifi, WifiOff } from 'lucide-react'

export function VotingPage() {
  const {
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
  } = useBallot()

  const [winner, setWinner] = useState<string | null>(null)

  const handleGetWinner = async () => {
    const winnerName = await getWinner()
    setWinner(winnerName)
  }

  const handleVote = async (proposalIndex: number) => {
    await vote(proposalIndex)
  }

  const handleSwitchNetwork = async () => {
    const success = await switchToLocalNetwork()
    if (success) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    if (isConnected) {
      handleGetWinner()
    }
  }, [isConnected, proposals])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Web3 投票系统</CardTitle>
            <CardDescription>连接您的钱包开始参与投票</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectWallet} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? '连接中...' : '连接钱包'}
            </Button>

            {networkInfo && !networkInfo.isSupported && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-center gap-2 text-orange-700 mb-2">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">网络不匹配</span>
                </div>
                <p className="text-sm text-orange-600 mb-3">
                  当前网络: {networkInfo.name}
                  <br />
                  需要切换到 Hardhat Local 网络
                </p>
                <Button onClick={handleSwitchNetwork} size="sm" variant="outline" className="w-full">
                  切换到本地网络
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 头部信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="w-6 h-6" />
                  Web3 投票系统
                </CardTitle>
                <CardDescription>当前账户: {formatAddress(account)}</CardDescription>
              </div>
              <div className="flex gap-2">
                {networkInfo && (
                  <Badge
                    variant={networkInfo.isSupported ? 'default' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    {networkInfo.isSupported ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {networkInfo.name}
                  </Badge>
                )}
                {voterInfo && (
                  <Badge variant={canVote ? 'default' : 'outline'}>{voterInfo.voted ? '已投票' : '可投票'}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 网络警告 */}
        {networkInfo && !networkInfo.isSupported && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <WifiOff className="w-5 h-5" />
                网络不匹配
              </CardTitle>
              <CardDescription className="text-orange-600">
                当前连接到 {networkInfo.name}，需要切换到 Hardhat Local 网络才能使用投票功能。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSwitchNetwork} className="w-full">
                切换到 Hardhat Local 网络
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">投票提案</h2>
              {winner && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  获胜者: {winner}
                </Badge>
              )}
            </div>

            {proposals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {networkInfo?.isSupported ? '暂无投票提案' : '请先切换到正确的网络'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {proposals.map((proposal, index) => (
                  <div className="flex items-center justify-between" key={index}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg mr-2">{proposal.name}</CardTitle>
                      <Badge variant="default">{proposal.voteCount} 票</Badge>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={!canVote || isLoading || !networkInfo?.isSupported}
                          variant={voterInfo?.vote === index && voterInfo?.voted ? 'secondary' : 'default'}
                        >
                          {voterInfo?.vote === index && voterInfo?.voted ? '已投票' : '投票'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认投票</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要投票给 &quot;{proposal.name}&quot; 吗？投票后无法更改。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleVote(index)}>确认投票</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 侧边栏功能 */}
          <div className="space-y-6">
            {/* 网络信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  网络状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {networkInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">网络名称:</span>
                      <span className="text-sm">{networkInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">链 ID:</span>
                      <span className="text-sm">{networkInfo.chainId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">状态:</span>
                      <Badge variant={networkInfo.isSupported ? 'default' : 'destructive'} className="text-xs">
                        {networkInfo.isSupported ? '已连接' : '不匹配'}
                      </Badge>
                    </div>
                    {!networkInfo.isSupported && (
                      <Button onClick={handleSwitchNetwork} size="sm" className="w-full">
                        切换网络
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 投票信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  投票信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {voterInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">投票状态:</span>
                      <span className="text-sm">{voterInfo.voted ? '已投票' : '未投票'}</span>
                    </div>
                    {voterInfo.voted && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">投票选择:</span>
                        <span className="text-sm">{proposals[voterInfo.vote]?.name || '未知'}</span>
                      </div>
                    )}
                  </>
                )}
                <Button onClick={() => loadContractData()} disabled={isLoading} variant="outline" className="w-full">
                  刷新数据
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
