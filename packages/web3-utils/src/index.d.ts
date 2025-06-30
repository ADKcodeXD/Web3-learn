import { ethers } from 'ethers';
import type { NetworkConfig } from '@repo/web3-types';
export declare const formatUtils: {
    formatAddress: (address: string, startLength?: number, endLength?: number) => string;
    formatTokenAmount: (amount: string | number, decimals?: number, displayDecimals?: number) => string;
    formatUSD: (amount: number | string) => string;
    formatPercent: (value: number | string, decimals?: number) => string;
};
export declare const validateUtils: {
    isValidAddress: (address: string) => boolean;
    isValidPrivateKey: (privateKey: string) => boolean;
    isValidTxHash: (hash: string) => boolean;
    isValidAmount: (amount: string) => boolean;
};
export declare const calculateUtils: {
    calculatePriceImpact: (amountIn: string, reserveIn: string, reserveOut: string, decimalsIn?: number, decimalsOut?: number) => string;
    calculateSlippage: (expectedAmount: string, actualAmount: string, decimals?: number) => string;
    calculateLPValue: (lpAmount: string, totalSupply: string, reserve0: string, reserve1: string, token0Price: string, token1Price: string, decimals?: number) => string;
};
export declare const networkUtils: {
    getNetworkConfig: (chainId: number) => NetworkConfig | null;
    isTestnet: (chainId: number) => boolean;
};
export declare const contractUtils: {
    getContract: (address: string, abi: any[], provider: any) => ethers.Contract;
    encodeFunctionCall: (abi: any[], functionName: string, params: any[]) => string;
    decodeFunctionCall: (abi: any[], data: string) => any;
};
export * from './wallet';
export * from './transactions';
export * from './defi';
//# sourceMappingURL=index.d.ts.map