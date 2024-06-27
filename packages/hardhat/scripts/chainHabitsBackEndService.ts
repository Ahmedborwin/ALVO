import hre from "hardhat";
import axios from "axios";
import dotenv from "dotenv";
// import { networks } from "../networks.js"; // Import networks
dotenv.config();

import deployedContractsObject from "../../../packages/nextjs/contracts/deployedContracts";

const deployedContracts = deployedContractsObject["default"];

const { CLIENT_ID, CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;

async function main() {
  const chainID = await hre.getChainId();

  const chainHabitsAbi = deployedContracts[chainID]["ChainHabits"].abi;
  const chainHabitsAddress = deployedContracts[chainID]["ChainHabits"].address;

  const { deployer } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(deployer);

  const chainHabits = await hre.ethers.getContractAt(chainHabitsAbi, chainHabitsAddress, signer);

  // try {
  // Read the Strava refresh token from the smart contract
  const userDetails = await chainHabits.getUserDetails(deployer);
  console.log("userDetails", userDetails);

  //read refresh token from smart contract
  const refreshToken = userDetails[6] ? userDetails[6] : null;

  // If there's no refresh token in the smart contract, use the one from the .env file
  const tokenToUse = refreshToken || STRAVA_REFRESH_TOKEN;

  // Request a new access token from Strava
  const response = await axios.post("https://www.strava.com/oauth/token", null, {
    params: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tokenToUse,
    },
  });

  const { access_token, refresh_token } = response.data;
  console.log("New Access Token:", access_token);
  console.log("New Refresh Token:", refresh_token);

  //   // Write the new refresh token back to the smart contract
  //   const tx = await contract.setStravaRefreshToken(refresh_token);
  //   await tx.wait();
  //   console.log("New refresh token saved to the smart contract");
  // }
  // catch (error) {
  //   console.error("Error:", error);
  // }
}

main().catch(console.error);
