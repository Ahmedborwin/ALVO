const { SubscriptionManager } = require("@chainlink/functions-toolkit");
const { networks } = require("../../../networks");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

async function addConsumer(contractAddress, subId, networkName = "baseSepolia") {
  // Dynamically import the specific version of ethers
  const ethersPath = path.resolve(__dirname, "./node_modules/ethers");
  const { ethers } = await import(ethersPath);

  const consumerAddress = contractAddress;
  const subscriptionId = parseInt(subId);

  const provider = new ethers.providers.JsonRpcProvider(networks[networkName].url);
  const wallet = new ethers.Wallet("bf0c60264942544c1ecb566e558207f5d84d08bd66d524bbc7df9b92b9d6f946");
  const signer = wallet.connect(provider);

  console.log(signer);

  const linkTokenAddress = networks[networkName].linkToken;
  const functionsRouterAddress = networks[networkName].functionsRouter;
  const txOptions = { confirmations: networks[networkName].confirmations };

  const sm = new SubscriptionManager({ signer, linkTokenAddress, functionsRouterAddress });
  await sm.initialize();

  console.log(`\nAdding ${consumerAddress} to subscription ${subscriptionId}...`);
  const addConsumerTx = await sm.addConsumer({ subscriptionId, consumerAddress, txOptions });
  console.log(`Added consumer contract ${consumerAddress} in Tx: ${addConsumerTx.hash}`);
}

const args = process.argv.slice(2);
const subId = args[0];
const contractAddress = args[1];

if (!subId || !contractAddress) {
  console.error("Usage: node addConsumer.js <subId> <contractAddress>");
  process.exit(1);
}

addConsumer(contractAddress, subId).catch(error => {
  console.error(error);
  process.exit(1);
});

module.exports = addConsumer;
