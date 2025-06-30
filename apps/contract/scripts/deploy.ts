const hre = require('hardhat')

async function main() {
  const [deployer] = await hre.ethers.getSigners()

  console.log('🗳️  开始部署 Ballot 合约...')
  console.log('📋 部署账户:', deployer.address)
  console.log('💰 账户余额:', hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), 'ETH')

  // 定义投票提案 (确保在32字节以内)
  const proposalNames = [
    'Increase Mining Rewards',
    'Lower Transaction Fees',
    'Add New Token Pairs',
    'Smart Contract Upgrade',
  ]

  const proposalNamesBytes32 = proposalNames.map((name) => {
    const truncatedName = name.length > 31 ? name.substring(0, 31) : name
    return hre.ethers.encodeBytes32String(truncatedName)
  })

  console.log('\n📊 投票提案:')
  proposalNames.forEach((name, index) => {
    console.log(`   ${index + 1}. ${name}`)
  })

  // 部署 Ballot 合约
  console.log('\n📄 部署 Ballot 合约...')

  const BallotFactory = await hre.ethers.getContractFactory('Ballot')
  const ballot = await BallotFactory.deploy(proposalNamesBytes32)

  await ballot.waitForDeployment()
  const ballotAddress = await ballot.getAddress()

  console.log('✅ Ballot 合约部署成功!')
  console.log('📍 合约地址:', ballotAddress)

  // 检查提案
  console.log('\n📋 已部署的提案:')
  for (let i = 0; i < proposalNames.length; i++) {
    try {
      const proposal = await ballot.proposals(i)
      const decodedName = hre.ethers.decodeBytes32String(proposal.name)
      console.log(`   ${i}: ${decodedName} (票数: ${proposal.voteCount})`)
    } catch (error) {
      console.log(`   ${i}: 无法解码提案名称 (票数: ${(await ballot.proposals(i)).voteCount})`)
    }
  }

  // 保存部署信息
  const deploymentInfo = {
    network: (await hre.ethers.provider.getNetwork()).name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      Ballot: {
        address: ballotAddress,
        proposalNames: proposalNames,
        proposalNamesBytes32: proposalNamesBytes32,
        constructorArgs: [proposalNamesBytes32],
      },
    },
  }

  console.log('\n📋 部署信息:')
  // 使用说明
  console.log('\n📖 使用说明:')
  console.log('1. 任何人都可以调用 winningProposal() 查看获胜提案')
  console.log('2. 任何人都可以调用 winnerName() 查看获胜提案名称')

  console.log('\n🎉 部署完成!')

  return {
    ballot,
    deploymentInfo,
  }
}

// 错误处理
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 部署失败:', error)
    process.exit(1)
  })
