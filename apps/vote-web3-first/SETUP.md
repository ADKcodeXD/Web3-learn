# 配置说明

## 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
# 合约配置
NEXT_PUBLIC_BALLOT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# 网络配置 (可选)
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# Infura API Key (如果使用测试网)
NEXT_PUBLIC_INFURA_API_KEY=your-infura-api-key
```

## 部署合约后的配置步骤

1. 在 `apps/contract` 目录部署合约：
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

2. 复制输出的合约地址

3. 更新 `lib/contract.ts` 中的合约地址：
   ```typescript
   export const BALLOT_CONTRACT_ADDRESS = "YOUR_ACTUAL_CONTRACT_ADDRESS";
   ```

## MetaMask 配置

1. 网络名称: `Hardhat Local`
2. RPC URL: `http://127.0.0.1:8545`
3. 链 ID: `31337`
4. 货币符号: `ETH`

## 测试账户

Hardhat 提供的测试账户可以在启动时看到，例如：
- Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
- Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)

您可以导入这些私钥到 MetaMask 进行测试。 