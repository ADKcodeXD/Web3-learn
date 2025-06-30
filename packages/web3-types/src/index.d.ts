export interface NetworkConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    blockExplorer?: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
}
export interface ContractConfig {
    address: string;
    abi: any[];
    networkId: number;
}
export interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
    chainId: number;
}
export interface TransactionRequest {
    to?: string;
    value?: string;
    data?: string;
    gasLimit?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
}
export interface TransactionResponse {
    hash: string;
    blockNumber?: number;
    blockHash?: string;
    timestamp?: number;
    confirmations: number;
    from: string;
    to?: string;
    value: string;
    gasUsed?: string;
    gasPrice?: string;
    status?: number;
}
export interface WalletState {
    isConnected: boolean;
    address?: string;
    chainId?: number;
    provider?: any;
}
export interface LiquidityPool {
    id: string;
    token0: TokenInfo;
    token1: TokenInfo;
    reserve0: string;
    reserve1: string;
    totalSupply: string;
    fee: number;
}
export interface SwapQuote {
    amountIn: string;
    amountOut: string;
    path: string[];
    priceImpact: string;
    slippage: string;
    gasEstimate: string;
}
export interface Web3Error {
    code: number;
    message: string;
    data?: any;
}
export interface ContractEvent {
    address: string;
    blockNumber: number;
    blockHash: string;
    transactionHash: string;
    transactionIndex: number;
    logIndex: number;
    event: string;
    args: any;
}
export declare enum TransactionStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed"
}
export declare enum WalletType {
    METAMASK = "metamask",
    WALLET_CONNECT = "walletconnect",
    COINBASE = "coinbase"
}
//# sourceMappingURL=index.d.ts.map