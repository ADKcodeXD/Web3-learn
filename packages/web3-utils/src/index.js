"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractUtils = exports.networkUtils = exports.calculateUtils = exports.validateUtils = exports.formatUtils = void 0;
const ethers_1 = require("ethers");
// 格式化工具函数
exports.formatUtils = {
    // 格式化以太坊地址
    formatAddress: (address, startLength = 6, endLength = 4) => {
        if (!address)
            return '';
        if (address.length <= startLength + endLength)
            return address;
        return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
    },
    // 格式化代币数量
    formatTokenAmount: (amount, decimals = 18, displayDecimals = 4) => {
        const formatted = (0, ethers_1.formatUnits)(amount.toString(), decimals);
        const num = parseFloat(formatted);
        if (num === 0)
            return '0';
        if (num < Math.pow(10, -displayDecimals))
            return `< ${Math.pow(10, -displayDecimals)}`;
        return num.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: displayDecimals,
        });
    },
    // 格式化 USD 金额
    formatUSD: (amount) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (num === 0)
            return '$0.00';
        if (num < 0.01)
            return '< $0.01';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    },
    // 格式化百分比
    formatPercent: (value, decimals = 2) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return `${num.toFixed(decimals)}%`;
    },
};
// 验证工具函数
exports.validateUtils = {
    // 验证以太坊地址
    isValidAddress: (address) => {
        try {
            return ethers_1.ethers.isAddress(address);
        }
        catch {
            return false;
        }
    },
    // 验证私钥
    isValidPrivateKey: (privateKey) => {
        try {
            new ethers_1.ethers.Wallet(privateKey);
            return true;
        }
        catch {
            return false;
        }
    },
    // 验证交易哈希
    isValidTxHash: (hash) => {
        return /^0x[a-fA-F0-9]{64}$/.test(hash);
    },
    // 验证数字输入
    isValidAmount: (amount) => {
        try {
            const num = parseFloat(amount);
            return !isNaN(num) && num > 0;
        }
        catch {
            return false;
        }
    },
};
// 计算工具函数
exports.calculateUtils = {
    // 计算价格影响
    calculatePriceImpact: (amountIn, reserveIn, reserveOut, decimalsIn = 18, decimalsOut = 18) => {
        try {
            const amountInBig = (0, ethers_1.parseUnits)(amountIn, decimalsIn);
            const reserveInBig = (0, ethers_1.parseUnits)(reserveIn, decimalsIn);
            const reserveOutBig = (0, ethers_1.parseUnits)(reserveOut, decimalsOut);
            const numerator = amountInBig * reserveOutBig;
            const denominator = (reserveInBig + amountInBig) * reserveInBig;
            const priceImpact = (numerator / denominator) * 100n;
            return (0, ethers_1.formatUnits)(priceImpact, decimalsOut);
        }
        catch {
            return '0';
        }
    },
    // 计算滑点
    calculateSlippage: (expectedAmount, actualAmount, decimals = 18) => {
        try {
            const expected = (0, ethers_1.parseUnits)(expectedAmount, decimals);
            const actual = (0, ethers_1.parseUnits)(actualAmount, decimals);
            const slippage = ((expected - actual) * 100n) / expected;
            return (0, ethers_1.formatUnits)(slippage, decimals);
        }
        catch {
            return '0';
        }
    },
    // 计算 LP 代币价值
    calculateLPValue: (lpAmount, totalSupply, reserve0, reserve1, token0Price, token1Price, decimals = 18) => {
        try {
            const lpBig = (0, ethers_1.parseUnits)(lpAmount, decimals);
            const totalSupplyBig = (0, ethers_1.parseUnits)(totalSupply, decimals);
            const reserve0Big = (0, ethers_1.parseUnits)(reserve0, decimals);
            const reserve1Big = (0, ethers_1.parseUnits)(reserve1, decimals);
            const price0Big = (0, ethers_1.parseUnits)(token0Price, decimals);
            const price1Big = (0, ethers_1.parseUnits)(token1Price, decimals);
            const share = lpBig / totalSupplyBig;
            const value0 = (reserve0Big * share * price0Big) / BigInt(10 ** decimals);
            const value1 = (reserve1Big * share * price1Big) / BigInt(10 ** decimals);
            return (0, ethers_1.formatUnits)(value0 + value1, decimals);
        }
        catch {
            return '0';
        }
    },
};
// 网络工具函数
exports.networkUtils = {
    // 获取网络配置
    getNetworkConfig: (chainId) => {
        const networks = {
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
        };
        return networks[chainId] || null;
    },
    // 检查是否为测试网络
    isTestnet: (chainId) => {
        const testnets = [11155111, 1337]; // Sepolia, Hardhat
        return testnets.includes(chainId);
    },
};
// 合约工具函数
exports.contractUtils = {
    // 获取合约实例
    getContract: (address, abi, provider) => {
        return new ethers_1.ethers.Contract(address, abi, provider);
    },
    // 编码函数调用
    encodeFunctionCall: (abi, functionName, params) => {
        const iface = new ethers_1.ethers.Interface(abi);
        return iface.encodeFunctionData(functionName, params);
    },
    // 解码函数调用
    decodeFunctionCall: (abi, data) => {
        const iface = new ethers_1.ethers.Interface(abi);
        return iface.decodeFunctionData(data.slice(0, 10), data);
    },
};
// 导出所有工具函数
__exportStar(require("./wallet"), exports);
__exportStar(require("./transactions"), exports);
__exportStar(require("./defi"), exports);
