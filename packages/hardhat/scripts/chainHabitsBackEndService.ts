import hre from "hardhat";
import axios from "axios";
import dotenv from "dotenv";
// import { networks } from "../networks.js"; // Import networks
dotenv.config();
import deployedContractsObject from "../../../packages/nextjs/contracts/deployedContracts";

// [x] initiate the chainhabits smart contract with a signer
// [x] read from smart contract which objective are due for review
// [] we are going to check if current epoch is part nextreviewdate
// [x] for those, read the user details struct to get the refresh token
// [x] call strava api to get new access token
// [x] refresh (if changed) to smart contract
// [X] retrieve users set objective - part of this struct will be the target miles
// [X] check if miles logged over last week meets users target
// [X] if meets target then pass
// [X] if fails then record failure somehow - mapping of interval to bool
// [X] check if last interval
// [X] if last interval mark challenge as complete
// [] work on adding script to a backend service - create an api that cron job can call

const deployedContracts = deployedContractsObject["default"];

const { CLIENT_ID, CLIENT_SECRET } = process.env;

async function main() {
  const chainID = await hre.getChainId();

  const chainHabitsAbi = deployedContracts[chainID]["ChainHabits"].abi;
  const chainHabitsAddress = deployedContracts[chainID]["ChainHabits"].address;

  const { deployer } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(deployer);

  const chainHabits = await hre.ethers.getContractAt(chainHabitsAbi, chainHabitsAddress, signer);

  const currentEpoch = Math.floor(Date.now() / 1000);

  //get all users Address array from public mapping
  const userAddressList = await chainHabits.allUsers();

  //filter to array of users with live challenge
  const Address_liveChallenges = userAddressList.filter(async user => {
    await chainHabits.userHasLiveChallenge(user); //user public mapping to determine users with live challenge
  });

  // for each live challenge handle review logic
  Address_liveChallenges.map(async user => {
    handleLogic(user);
  });

  const handleLogic = async user => {
    const _userDetails = await chainHabits.getUserDetails(user);

    const userDetails = {
      challengeTally: _userDetails[0],
      SuccessfulChallenges: _userDetails[1],
      currenStaked: _userDetails[2],
      totalDonated: _userDetails[3],
      userID: _userDetails[4],
      refreshToken: _userDetails[5],
    };

    // Request a new access token from Strava
    const response = await axios.post("https://www.strava.com/oauth/token", null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: userDetails.refreshToken,
      },
    });

    const { new_access_token, new_refresh_token } = response.data;
    console.log("New Access Token:", new_access_token);
    console.log("New Refresh Token:", new_refresh_token);

    //check if refresh token changed
    if (new_refresh_token !== userDetails.refreshToken) {
      // Write the new refresh token back to the smart contract
      const handleRefreshToken = await chainHabits.updateRefreshToken(new_refresh_token);
      await handleRefreshToken.wait();
      console.log("New refresh token saved to the smart contract");
    }

    //get challenge ID
    const challengeId = await chainHabits.getChallengeId(user);
    const _challengeDetails = await chainHabits.getChallengeDetails(challengeId);

    const challengeDetails = {
      objective: _challengeDetails[0],
      targetMiles: _challengeDetails[1],
      NoOfWeeks: _challengeDetails[2],
      failedWeeks: _challengeDetails[3],
      isLive: _challengeDetails[4],
      competitionDeadline: _challengeDetails[5],
      currentIntervalEpoch: _challengeDetails[6],
      nextIntervalEpoch: _challengeDetails[7],
      defaultAddress: _challengeDetails[8],
    };

    //TODO how can i make sure that that
    if (currentEpoch >= challengeDetails.nextIntervalEpoch) {
      const distanceLogged = await getAthletesStravaData(challengeDetails, new_access_token);
      const nextInterval = challengeDetails.currentIntervalEpoch + 604800;
      //check if distance logged meets target
      if (distanceLogged < challengeDetails.targetMiles) {
        challengeDetails.failedWeeks++; //update local challengeObject incase its the final interval review

        await chainHabits.handleIntervalReview(challengeId, true, challengeDetails.nextIntervalEpoch, nextInterval);
      } else {
        await chainHabits.handleIntervalReview(challengeId, false, challengeDetails.nextIntervalEpoch, nextInterval);
      }
    }

    //check if challenge is over
    if (challengeDetails.competitionDeadline <= currentEpoch) {
      //evaluate how much is to be sent to defaul address
      const ethToDefault = userDetails.currenStaked / challengeDetails.failedWeeks;

      await chainHabits.handleCompleteChallenge(challengeId, ethToDefault);
    }
  };

  async function getAthletesStravaData(challengeDetails, new_access_token) {
    {
      try {
        const url = `https://www.strava.com/api/v3/athlete/activities?before=${challengeDetails.nextIntervalEpoch}&after=${challengeDetails.currentIntervalEpoch}&page=1&per_page=30`;
        const stravaGetAtheleteResponse = await axios.post(url, null, {
          headers: {
            "Content-Type": `application/json`,
            Authorization: `Bearer ${new_access_token}`,
          },
        });

        const data = stravaGetAtheleteResponse["data"];
        const arrayOfRuns = data.filter(event => {
          return event.workout_type == 0;
        });

        console.log("@@arrayOfRuns", arrayOfRuns);

        const distanceLogged = arrayOfRuns.reduce((acc, event) => {
          return acc + parseInt(event.distance);
        }, 0);

        distanceLogged / 100;

        console.log("meters logged:", distanceLogged);
        return distanceLogged;
      } catch (e) {
        console.log(e);
        return;
      }
    }
  }
}

main().catch(console.error);
