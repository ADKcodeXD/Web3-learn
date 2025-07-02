'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWallet } from '@/hooks/use-wallet'
import { PAYMENT_ABI } from '@/lib/contract/payment.abi'
import { PAYMENT_CONTRACT_ADDRESS } from '@/lib/contract/const'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { ethers } from 'ethers'

export default function page() {
  const { isConnected, account, networkInfo, getContract, isLoading, connectWallet, balance, disconnectWallet } =
    useWallet()
  const [tokenContract, setTokenContract] = useState<any>(null)
  const [selectedToken, setSelectedToken] = useState<any>({
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  })
  const [payAmount, setPayAmount] = useState<number>(0.001)

  const tokenList = [
    {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    {
      name: 'USDT',
      symbol: 'USDT',
      decimals: 6,
    },
  ]

  const presetAmounts = [
    {
      ETH: 0.001,
      USDT: 10,
    },
    {
      ETH: 0.01,
      USDT: 100,
    },
    {
      ETH: 0.1,
      USDT: 1000,
    },
  ]

  const isEqual = (a: number, b: number) => {
    const EPSILON = 0.0000000001
    return Math.abs(a - b) < EPSILON
  }

  const pay = async () => {
    if (!isConnected) {
      await connectWallet()
    }
    if (selectedToken?.name === 'ETH') {
      await tokenContract.payETH('支付', {
        value: ethers.parseEther(payAmount.toString()),
      })
    } else {
      // await tokenContract.payToken(payAmount, '支付')
    }
    alert('支付成功')
  }

  useEffect(() => {
    if (isConnected) {
      const contract = getContract(PAYMENT_CONTRACT_ADDRESS, PAYMENT_ABI)
      setTokenContract(contract)
    }
  }, [isConnected])

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>支付</CardTitle>
        {isConnected ? (
          <div className="flex flex-col gap-2">
            <p>钱包余额：{balance} ETH</p>
            <p>钱包地址：{account}</p>
            <p>网络：{networkInfo?.name}</p>
            <Button onClick={() => disconnectWallet()}>断开钱包</Button>
          </div>
        ) : (
          <div>
            未连接钱包 <Button onClick={() => connectWallet()}>连接钱包</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p>请选择你的支付方式</p>
        <div className="flex flex-wrap gap-2">
          {tokenList.map((token) => (
            <div
              key={token.name}
              onClick={() => {
                setSelectedToken(token)
              }}
              className={`inline-flex cursor-pointer w-20 items-center justify-center rounded-md border border-gray-200 p-2 ${
                token.name === selectedToken?.name ? 'bg-gray-200 border-gray-200' : ''
              }`}
            >
              <p>{token.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p>请输入支付金额</p>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((amount) => (
              <div
                key={amount[selectedToken?.name as keyof typeof amount]}
                className={`inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-200 p-2 ${
                  isEqual(payAmount, amount?.[selectedToken?.name as keyof typeof amount])
                    ? 'bg-gray-200 border-gray-200'
                    : ''
                }`}
                onClick={() => {
                  setPayAmount(amount?.[selectedToken?.name as keyof typeof amount])
                }}
              >
                {selectedToken?.name === 'ETH' ? <p>{amount.ETH} ETH</p> : <p>{amount.USDT} USDT</p>}
              </div>
            ))}
            <Input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="mt-4">
            <Button onClick={pay}>支付</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
