const hre = require('hardhat')
const chairPerson = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'

async function deployPaymentAccount() {
  const PaymentAccountFactory = await hre.ethers.getContractFactory('PaymentAccount')
  const paymentAccount = await PaymentAccountFactory.deploy(chairPerson)
  await paymentAccount.waitForDeployment()
  const paymentAccountAddress = await paymentAccount.getAddress()
  console.log('✅ PaymentAccount 合约部署成功!')
  console.log('📍 合约地址:', paymentAccountAddress)
  return {
    paymentAccount,
    paymentAccountAddress,
  }
}

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

  const { paymentAccount, paymentAccountAddress } = await deployPaymentAccount()

  console.log('✅ Ballot 合约部署成功!')
  console.log('📍 合约地址:', ballotAddress)
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
      PaymentAccount: {
        address: paymentAccountAddress,
      },
    },
  }

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
