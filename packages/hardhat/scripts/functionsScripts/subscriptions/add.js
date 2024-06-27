const { SubscriptionManager } = require("@chainlink/functions-toolkit");
const { networks } = require("../../../networks");

async function addConsumer(contractAddress, subId, networkName = "baseSepolia", signer) {
  const consumerAddress = contractAddress;
  const subscriptionId = parseInt(subId);

  console.log(signer, "@@@signer");

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

addConsumer(subId, contractAddress).catch(error => {
  console.error(error);
  process.exit(1);
});

module.exports = addConsumer;
