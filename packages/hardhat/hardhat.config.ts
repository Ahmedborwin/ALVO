import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { networks } from "../hardhat/networks.js";

// If not set, it uses ours Etherscan default API key.
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";
const REPORT_GAS = process.env.REPORT_GAS?.toLowerCase() === "true" ? true : false;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  // networks: { ...networks },
  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: {
      mainnet: networks.ethereum.verifyApiKey,
      avalanche: networks.avalanche.verifyApiKey,
      polygon: networks.polygon.verifyApiKey,
      sepolia: networks.ethereumSepolia.verifyApiKey,
      polygonMumbai: networks.polygonMumbai.verifyApiKey,
      avalancheFujiTestnet: networks.avalancheFuji.verifyApiKey,
      arbitrumSepolia: networks.arbitrumSepolia.verifyApiKey,
      baseSepolia: networks.baseSepolia.verifyApiKey,
      optimismSepolia: networks.optimismSepolia.verifyApiKey,
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia-explorer.base.org",
        },
      },
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api", // https://docs.optimism.etherscan.io/v/optimism-sepolia-etherscan
          browserURL: "https://sepolia-optimistic.etherscan.io/",
        },
      },
    ],
  },
  // configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: `${etherscanApiKey}`,
    },
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
