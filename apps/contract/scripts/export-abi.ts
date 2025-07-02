import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { PaymentAccount__factory } from '../src/types'

// 目标目录 - 前端项目的 lib/contract 目录
const outputDir = join(__dirname, '../../vote-web3-first/lib/contract')

// 确保目录存在
try {
  mkdirSync(outputDir, { recursive: true })
} catch (err) {
  // 目录可能已存在
}

// 导出 PaymentAccount ABI
const paymentAbi = PaymentAccount__factory.abi
const paymentAbiContent = `export const PAYMENT_ABI = ${JSON.stringify(paymentAbi, null, 2)} as const`

writeFileSync(join(outputDir, 'payment.abi.ts'), paymentAbiContent)
console.log('✅ PaymentAccount ABI exported to payment.abi.ts')

// 导出类型定义
const typesContent = `// Auto-generated contract types
export type { PaymentAccount, PaymentAccountInterface } from '@repo/contracts/src/types/PaymentAccount.sol/PaymentAccount'
export type { IERC20, IERC20Interface } from '@repo/contracts/src/types/PaymentAccount.sol/IERC20'

// Factory exports for contract deployment and connection
export { PaymentAccount__factory } from '@repo/contracts/src/types/factories/PaymentAccount.sol/PaymentAccount__factory'
export { IERC20__factory } from '@repo/contracts/src/types/factories/PaymentAccount.sol/IERC20__factory'
`

writeFileSync(join(outputDir, 'payment.types.ts'), typesContent)
console.log('✅ PaymentAccount types exported to payment.types.ts')

console.log('🎉 PaymentAccount ABI and types exported successfully!')
console.log('')
console.log('📝 To use in your frontend:')
console.log('   import { PAYMENT_ABI } from "@/lib/contract/payment.abi"')
console.log('   import { PaymentAccount__factory } from "@/lib/contract/payment.types"')
