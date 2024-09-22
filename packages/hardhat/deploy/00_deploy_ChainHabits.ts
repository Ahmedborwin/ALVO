import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract, ethers, ZeroAddress } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployChainHabits: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*

  */
  const { deployer } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(deployer);

  const { deploy } = hre.deployments;

  await deploy("ChainHabits", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const chainHabits = await hre.ethers.getContract<Contract>("ChainHabits", signer);
  const chainHabitsAddress = await chainHabits.getAddress();

  //add priceFeed address's - for now add sepolia and basesepolia USDC.

  const tx = await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
  await tx.wait();

  const tx2 = await await chainHabits.createNewChallenge(
    1, //strava based challenge type
    "Run marathon",
    200,
    4,
    "0x5f2AF68dF96F3e58e1a243F4f83aD4f5D0Ca6029",
    5, // percentage increase
    ZeroAddress,
    0,
    53457243, //latitude
    -2244550, //longitude
    {
      value: ethers.parseEther("0.01"),
    },
  );
  await tx2.wait();

  //verfiy smart contract
  if (
    hre.network.name !== "localhost" &&
    hre.network.name !== "localFunctionsTestnet" &&
    hre.network.name !== "hardhat"
  ) {
    console.log("-----------Verifying Contract-----------");
    await hre.run("verify:verify", {
      address: chainHabitsAddress,
      constructorArguments: [],
    });
  }
};

export default deployChainHabits;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployChainHabits.tags = ["chainHabits"];
