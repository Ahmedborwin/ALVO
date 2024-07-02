// All supported networks and related contract addresses are defined here.
//
// LINK token addresses: https://docs.chain.link/resources/link-token-contracts/
// Price feeds addresses: https://docs.chain.link/data-feeds/price-feeds/addresses
// Chain IDs: https://chainlist.org/?testnets=true

// Loads environment variables from .env.enc file (if it exists)
require("dotenv").config();

const DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS = 2;

const npmCommand = process.env.npm_lifecycle_event;
const isTestEnvironment = npmCommand == "test" || npmCommand == "test:unit";

const isSimulation = process.argv.length === 3 && process.argv[2] === "functions-simulate-script" ? true : false;

// Set EVM private keys (required)
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
// TODO @dev - set this to run the accept.js task.
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2;

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

if (!isTestEnvironment && !isSimulation && !PRIVATE_KEY) {
  throw Error("Set the PRIVATE_KEY environment variable with your EVM wallet private key");
}

const accounts = [];
if (PRIVATE_KEY) {
  accounts.push(PRIVATE_KEY);
}
if (PRIVATE_KEY_2) {
  accounts.push(PRIVATE_KEY_2);
}

const networks = {
  ethereum: {
    url: process.env.ETHEREUM_RPC_URL || "UNSET",
    gasPrice: undefined, // gas price for the functions request - default's to auto as per HH https://hardhat.org/hardhat-network/docs/reference#eth_gasprice
    nonce: undefined,
    accounts,
    verifyApiKey: process.env.ETHERSCAN_API_KEY || "UNSET",
    chainId: 1,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    linkToken: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    linkPriceFeed: "0xDC530D9457755926550b59e8ECcdaE7624181557", // LINK/ETH
    functionsRouter: "0x65Dcc24F8ff9e51F10DCc7Ed1e4e2A61e6E14bd6",
    donId: "fun-ethereum-mainnet-1",
    gatewayUrls: ["https://01.functions-gateway.chain.link/", "https://02.functions-gateway.chain.link/"],
  },
  avalanche: {
    url: process.env.AVALANCHE_RPC_URL || "UNSET",
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    verifyApiKey: process.env.SNOWTRACE_API_KEY || "UNSET",
    chainId: 43114,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "AVAX",
    linkToken: "0x5947BB275c521040051D82396192181b413227A3",
    linkPriceFeed: "0x1b8a25F73c9420dD507406C3A3816A276b62f56a", // LINK/AVAX
    functionsRouter: "0x9f82a6A0758517FD0AfA463820F586999AF314a0",
    donId: "fun-avalanche-mainnet-1",
    gatewayUrls: ["https://01.functions-gateway.chain.link/", "https://02.functions-gateway.chain.link/"],
  },
  polygon: {
    url: process.env.POLYGON_RPC_URL || "UNSET",
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    verifyApiKey: process.env.POLYGONSCAN_API_KEY || "UNSET",
    chainId: 137,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    linkToken: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
    linkPriceFeed: "0x5787BefDc0ECd210Dfa948264631CD53E68F7802", // LINK/MATIC
    functionsRouter: "0xdc2AAF042Aeff2E68B3e8E33F19e4B9fA7C73F10",
    donId: "fun-polygon-mainnet-1",
    gatewayUrls: ["https://01.functions-gateway.chain.link/", "https://02.functions-gateway.chain.link/"],
  },
  ethereumSepolia: {
    url: process.env.ETHEREUM_SEPOLIA_RPC_URL || "UNSET",
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    subscriptionId: 1843,
    verifyApiKey: process.env.ETHERSCAN_API_KEY || "UNSET",
    chainId: 11155111,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    linkPriceFeed: "0x42585eD362B3f1BCa95c640FdFf35Ef899212734", // LINK/ETH
    functionsRouter: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
    donId: "fun-ethereum-sepolia-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ], //VRF Variables
    vrfCoordinatorV2: "0x9ddfaca8183c41ad55329bdeed9f6a8d53168b1b",
    gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    callbackGasLimit: "2500000", // 2,500,000 gas
    vrfSubscriptionId: "112962707688958146916079652617488254597188946239164302805618079293397607680996", // add your ID here!
  },
  polygonMumbai: {
    url: process.env.POLYGON_MUMBAI_RPC_URL || "UNSET",
    gasPrice: 20_000_000_000, // gas price for the functions request
    nonce: undefined,
    accounts,
    verifyApiKey: process.env.POLYGONSCAN_API_KEY || "UNSET",
    chainId: 80001,
    confirmations: 10,
    nativeCurrencySymbol: "MATIC",
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    linkPriceFeed: "0x12162c3E810393dEC01362aBf156D7ecf6159528", // LINK/MATIC
    functionsRouter: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C",
    donId: "fun-polygon-mumbai-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ],
  },
  avalancheFuji: {
    url: process.env.AVALANCHE_FUJI_RPC_URL || "UNSET",
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    verifyApiKey: process.env.FUJI_SNOWTRACE_API_KEY || "UNSET",
    chainId: 43113,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "AVAX",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    linkPriceFeed: "0x79c91fd4F8b3DaBEe17d286EB11cEE4D83521775", // LINK/AVAX
    functionsRouter: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0",
    donId: "fun-avalanche-fuji-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ],
    //FunctionsSubID
    subscriptionId: 1620,
    //VRF Variables
    vrfCoordinatorV2: "0x5c210ef41cd1a72de73bf76ec39637bb0d3d7bee",
    gasLane: "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887",
    callbackGasLimit: "2500000", // 500,000 gas
    vrfSubscriptionId: "22893234025567037033211099490406710378626671179684264872588321889309253644677", // add your ID here!
  },
  arbitrumSepolia: {
    url: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}` || "UNSET",
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    subscriptionId: 59,
    verifyApiKey: process.env.ARBISCAN_API_KEY || "UNSET",
    chainId: 421614,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    linkToken: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    linkPriceFeed: "0x3ec8593F930EA45ea58c968260e6e9FF53FC934f", // LINK/ETH
    functionsRouter: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
    donId: "fun-arbitrum-sepolia-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ],
    //VRF Variables
    vrfCoordinatorV2: "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61",
    gasLane: "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be",
    callbackGasLimit: "2500000", // 2,500,000 gas
    vrfSubscriptionId: "48125460975452738352769560243362603208942727282100407618626170760680889733130", // add your ID here!
  },
  baseSepolia: {
    url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    subscriptionId: 98,
    verifyApiKey: process.env.BASESCAN_API_KEY || "UNSET",
    chainId: 84532,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    linkToken: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    linkPriceFeed: "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69", // https://docs.chain.link/data-feeds/price-feeds/addresses?network=base&page=1
    functionsRouter: "0xf9B8fc078197181C841c296C876945aaa425B278",
    donId: "fun-base-sepolia-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ],
  },
  optimismSepolia: {
    url: process.env.OPTIMISM_SEPOLIA_RPC_URL || "UNSET", // https://docs.optimism.io/chain/networks#op-sepolia
    gasPrice: undefined,
    nonce: undefined,
    accounts,
    verifyApiKey: process.env.OPTIMISM_API_KEY || "UNSET",
    chainId: 11155420,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    linkToken: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    linkPriceFeed: "0x98EeB02BC20c5e7079983e8F0D0D839dFc8F74fA", //https://docs.chain.link/data-feeds/price-feeds/addresses?network=optimism&page=1#optimism-sepolia
    functionsRouter: "0xC17094E3A1348E5C7544D4fF8A36c28f2C6AAE28",
    donId: "fun-optimism-sepolia-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ],
  },
  // localFunctionsTestnet is updated dynamically by scripts/startLocalFunctionsTestnet.js so it should not be modified here
  localFunctionsTestnet: {
    url: "http://localhost:8545/",
    accounts,
    confirmations: 1,
    nativeCurrencySymbol: "ETH",
    linkToken: "0x343FAF709FB7e492c4a3f7DC8dE8E5Df7d55cc43",
    functionsRouter: "0x80fd802CdbCfF693a6d45E6b4f710fA6Ff2445d1",
    donId: "local-functions-testnet",
  },

  // localhost: {
  //   url: "http://localhost:8545/",
  //   accounts,
  //   confirmations: 1,
  //   nativeCurrencySymbol: "ETH",
  //   linkToken: "0x2a8dF1E1A9d7ED2DC5e5204209fd788930AD3a1f",
  //   functionsRouter: "0x165de7Ce4D0254DC7756498640aA79458302bFC0",
  //   donId: "local-functions-testnet",
  // },
};

module.exports = {
  networks,
};
