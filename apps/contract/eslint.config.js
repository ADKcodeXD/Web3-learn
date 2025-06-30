const baseConfig = require("@repo/eslint-config/base");

module.exports = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...require("globals").node,
      },
    },
    rules: {
      // Hardhat 特定规则
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // 允许 console.log 在脚本中
      "no-console": "off",
    },
  },
]; 