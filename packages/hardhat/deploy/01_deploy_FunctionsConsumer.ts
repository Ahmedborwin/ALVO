import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { networks } from "../networks.js"; // Import networks
import * as fs from "fs"; // Import fs module
import * as path from "path"; // Import path module
/**
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployAPIConsumer: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  //get router and donId based on network
  console.log(hre.network.name, "@@network");
  const functionsRouterAddress = networks[hre.network.name]["functionsRouter"];
  const donIdBytes32 = hre.ethers.encodeBytes32String(networks[hre.network.name]["donId"]);
  const subId = networks[hre.network.name]["subscriptionId"] ? networks[hre.network.name]["subscriptionId"] : "1";
  const callbackGasLimit = 300000;

  await deploy("APIConsumer", {
    from: deployer,
    args: [functionsRouterAddress, donIdBytes32], // Contract constructor arguments
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const apiConsumer = await hre.ethers.getContract<Contract>("APIConsumer", deployer);
  console.log("👋 API Consumer Deployed to:", await apiConsumer.getAddress());

  //pre-populate variables
  //populate js script for gameEngine
  const scriptPath = path.resolve(__dirname, "../scripts/APICallsJS/getAthleteData.js");
  await apiConsumer.populateStravaCall(fs.readFileSync(scriptPath).toString());

  //populate subID and gaslimit
  await apiConsumer.populateSubIdANDGasLimit(subId, callbackGasLimit);
};

export default deployAPIConsumer;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployAPIConsumer.tags = ["APIConsumer"];
