# Web3 投票系统

一个基于以太坊智能合约的去中心化投票系统，使用 Next.js + shadcn/ui + ethers.js 构建。

## 功能特性

- 🗳️ **投票功能** - 用户可以对提案进行投票
- 🤝 **委托投票** - 将投票权委托给其他用户
- 👑 **主席权限** - 主席可以授予用户投票权
- 📊 **实时结果** - 查看投票统计和获胜提案
- 💳 **钱包连接** - 支持 MetaMask 钱包连接
- 🎨 **现代 UI** - 使用 shadcn/ui 组件库的美观界面

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动 Hardhat 本地网络

在 `apps/contract` 目录下：

```bash
# 启动本地区块链
npx hardhat node

# 新开终端部署合约
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. 配置合约地址

部署成功后，将合约地址复制到 `lib/contract.ts` 文件中：

```typescript
export const BALLOT_CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
```

### 4. 配置 MetaMask

1. 打开 MetaMask
2. 添加本地网络：
   - 网络名称: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - 链 ID: 31337
   - 货币符号: ETH

3. 导入 Hardhat 测试账户私钥（可选）

### 5. 启动前端应用

```bash
npm run dev
```

访问 http://localhost:3000

## 使用说明

### 连接钱包
1. 点击"连接钱包"按钮
2. 在 MetaMask 中确认连接

### 投票流程
1. **获得投票权**：主席需要先给您的地址授予投票权
2. **查看提案**：在主界面查看所有可投票的提案
3. **投票**：点击提案的"投票"按钮，确认交易
4. **查看结果**：投票后可以看到实时的投票统计

### 委托投票
如果您有投票权但不想直接投票，可以：
1. 在侧边栏找到"委托投票"区域
2. 输入要委托的地址
3. 点击"委托投票"并确认交易

### 主席功能
如果您是主席（合约部署者），可以：
1. 在侧边栏找到"授权投票"区域
2. 输入要授权的用户地址
3. 点击"授权投票"给该用户投票权

## 合约功能

### 核心方法

- `vote(uint proposal)` - 投票给指定提案
- `delegate(address to)` - 委托投票权给指定地址
- `giveRightToVote(address voter)` - 主席给地址授予投票权
- `winningProposal()` - 获取获胜提案索引
- `winnerName()` - 获取获胜提案名称

### 状态查询

- `chairperson()` - 查看主席地址
- `voters(address)` - 查看指定地址的投票信息
- `proposals(uint)` - 查看指定提案的信息

## 项目结构

```
apps/vote-web3-first/
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   └── voting-page.tsx     # 主要投票页面组件
├── hooks/
│   └── use-ballot.ts       # 合约交互 Hook
├── lib/
│   ├── contract.ts         # 合约配置和 ABI
│   └── utils.ts           # 工具函数
├── types/
│   └── global.d.ts        # 全局类型声明
└── app/
    ├── layout.tsx
    ├── page.tsx           # 主页面
    └── globals.css        # 全局样式
```

## 技术栈

- **前端框架**: Next.js 15
- **UI 组件**: shadcn/ui + Tailwind CSS
- **Web3 库**: ethers.js
- **智能合约**: Solidity
- **开发环境**: Hardhat
- **类型检查**: TypeScript

## 注意事项

1. **合约地址配置**：每次重新部署合约后需要更新 `lib/contract.ts` 中的合约地址
2. **网络配置**：确保 MetaMask 连接到正确的网络
3. **Gas 费用**：所有交易都需要支付 Gas 费用
4. **投票权限**：只有被主席授权的地址才能投票
5. **投票唯一性**：每个地址只能投票一次

## 开发和调试

### 查看合约状态

```bash
# 在 Hardhat 控制台中查看合约状态
npx hardhat console --network localhost
```

### 重置本地区块链

```bash
# 重启 Hardhat 网络会重置所有状态
npx hardhat node
```

### 常见问题

1. **MetaMask 连接失败**：检查网络配置是否正确
2. **交易失败**：查看浏览器控制台的错误信息
3. **投票权限问题**：确保地址已被主席授权
4. **合约地址错误**：确认 `lib/contract.ts` 中的地址是否正确

## 许可证

GPL-3.0
