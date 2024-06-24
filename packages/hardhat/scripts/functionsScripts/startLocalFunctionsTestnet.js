const process = require("process");
const path = require("path");
const fs = require("fs");
const { startLocalFunctionsTestnet } = require("@chainlink/functions-toolkit");
const { parseEther, Wallet } = require("ethers");
// Loads environment variables from .env.enc file (if it exists)
require("dotenv").config("../../.env");

(async () => {
  const requestConfigPath = path.join(process.cwd(), "Functions-request-config.js"); // @dev Update this to point to your desired request config file
  console.log(`Using Functions request config file ${requestConfigPath}\n`);

  const localFunctionsTestnetInfo = await startLocalFunctionsTestnet(
    requestConfigPath,
    {
      logging: {
        debug: false,
        verbose: false,
        quiet: false, // Set this to `false` to see logs from the local testnet
      },
    }, // Ganache server options (optional)
  );

  console.table({
    "FunctionsRouter Contract Address": localFunctionsTestnetInfo.functionsRouterContract.address,
    "DON ID": localFunctionsTestnetInfo.donId,
    "Mock LINK Token Contract Address": localFunctionsTestnetInfo.linkTokenContract.address,
    "Mock Coordinator Address": localFunctionsTestnetInfo.functionsMockCoordinatorContract.address,
  });

  // Fund wallets with ETH and LINK
  const addressToFund = new Wallet("0x6c455eb33b4e2abaea3396083b51c3968175437d7dbc7b03ec2675c34c05070e").address;
  await localFunctionsTestnetInfo.getFunds(addressToFund, {
    weiAmount: parseEther("100").toString(), // 100 ETH
    juelsAmount: parseEther("100").toString(), // 100 LINK
  });
  if (process.env["SECOND_PRIVATE_KEY"]) {
    const secondAddressToFund = new Wallet(process.env["SECOND_PRIVATE_KEY"]).address;
    await localFunctionsTestnetInfo.getFunds(secondAddressToFund, {
      weiAmount: parseEther("100").toString(), // 100 ETH
      juelsAmount: parseEther("100").toString(), // 100 LINK
    });
  }

  // Update values in networks.js
  let networkPath = (__dirname, "packages/hardhat/networks.js");
  let networksConfig = fs.readFileSync(networkPath).toString();

  const regex = /localFunctionsTestnet:\s*{\s*([^{}]*)\s*}/s;
  const newContent = `localFunctionsTestnet: {
    url: "http://localhost:8545/",
    accounts,
    confirmations: 1,
    nativeCurrencySymbol: "ETH",
    linkToken: "${localFunctionsTestnetInfo.linkTokenContract.address}",
    functionsRouter: "${localFunctionsTestnetInfo.functionsRouterContract.address}",
    donId: "${localFunctionsTestnetInfo.donId}",
  }`;
  networksConfig = networksConfig.replace(regex, newContent);
  fs.writeFileSync(path.join(process.cwd(), "networks.js"), networksConfig);
})();
