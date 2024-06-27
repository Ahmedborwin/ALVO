import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { networks } from "../networks.js"; // Import networks
import * as fs from "fs";
import * as path from "path";
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
  const apiConsumerAddress = await apiConsumer.getAddress();
  console.log("👋 API Consumer Deployed to: ", apiConsumerAddress);

  //pre-populate variables
  //populate js script for gameEngine
  const scriptPath = path.resolve(__dirname, "../scripts/APICallsJS/getAthleteData.js");
  await apiConsumer.populateStravaCall(fs.readFileSync(scriptPath).toString());

  //populate subID and gaslimit
  await apiConsumer.populateSubIdANDGasLimit(subId, callbackGasLimit);

  //verfiy smart contract
  if (hre.network.name !== "localhost" && hre.network.name !== "localFunctionsTestnet") {
    console.log("-----------Verifying Contract-----------");
    await hre.run("verify:verify", {
      address: apiConsumerAddress,
      constructorArguments: [functionsRouterAddress, donIdBytes32],
    });
  }

  if (hre.network.name == "localFunctionsTestnet") {
    //create subscription
  } else if (hre.network.name !== "localhost") {
    //Add API address as a consumer to functions subscription
    console.log("-----------add consumer to subscription-------------------");
    // await addSubscription(apiConsumerAddress, subId, hre.network.name, signer);
  }
};

export default deployAPIConsumer;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployAPIConsumer.tags = ["APIConsumer"];
