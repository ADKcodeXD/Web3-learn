"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletType = exports.TransactionStatus = void 0;
// 导出常用枚举
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["SUCCESS"] = "success";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var WalletType;
(function (WalletType) {
    WalletType["METAMASK"] = "metamask";
    WalletType["WALLET_CONNECT"] = "walletconnect";
    WalletType["COINBASE"] = "coinbase";
})(WalletType || (exports.WalletType = WalletType = {}));
