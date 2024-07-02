import hre from "hardhat";
import axios from "axios";
import dotenv from "dotenv";
// import { networks } from "../networks.js"; // Import networks
dotenv.config();
import deployedContracts from "../../nextjs/contracts/deployedContracts";
import { ChainHabits } from "../typechain-types/contracts/index";

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
// [] deploy project on vercel
// [] add env variables to vercel
// [] add script as script with cron job on vercel

const { CLIENT_ID, CLIENT_SECRET } = process.env;

async function main() {
  const chainID = await hre.getChainId();
  console.log("chainID", chainID);

  // const chainHabitsAbi = deployedContracts[chainID]["ChainHabits"].abi;
  console.log(deployedContracts);
  const chainHabitsAddress = deployedContracts[chainID]["ChainHabits"].address;

  const { deployer } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(deployer);

  const chainHabits: ChainHabits = await hre.ethers.getContractAt("ChainHabits", chainHabitsAddress, signer);

  const currentEpoch = Math.floor(Date.now() / 1000);

  //get all users Address array from public mapping
  const userAddressList = await chainHabits.getAllUserDetails();

  console.log("userAddressList", userAddressList);

  //filter to array of users with live challenge
  const Address_liveChallenges = userAddressList.filter(async user => {
    await chainHabits.userHasLiveChallenge(user); //user public mapping to determine users with live challenge
  });

  console.log("Address_liveChallenges", Address_liveChallenges);

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

    const data = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: userDetails.refreshToken,
    };

    try {
      // Request a new access token from Strava
      const response = await axios.post("https://www.strava.com/oauth/token", data);

      const { access_token: new_access_token, refresh_token: new_refresh_token } = response.data;
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
      console.log(challengeId);
      const _challengeDetails = await chainHabits.getChallengeDetails(challengeId);
      console.log(_challengeDetails);

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
      const testEpoch = currentEpoch + 604800;
      if (testEpoch >= challengeDetails.nextIntervalEpoch) {
        const distanceLogged = await getAthletesStravaData(challengeDetails, new_access_token);
        const nextInterval = challengeDetails.currentIntervalEpoch + BigInt(604800);

        //check if distance logged meets target
        if (distanceLogged < challengeDetails.targetMiles) {
          challengeDetails.failedWeeks++; //update local challengeObject incase its the final interval review

          const tx = await chainHabits.handleIntervalReview(
            challengeId,
            true,
            challengeDetails.nextIntervalEpoch,
            nextInterval,
          );
          await tx.wait();
        } else {
          const tx = await chainHabits.handleIntervalReview(
            challengeId,
            false,
            challengeDetails.nextIntervalEpoch,
            nextInterval,
          );
          await tx.wait();
        }

        const _challengeDetailsUpdated = await chainHabits.getChallengeDetails(challengeId);
        console.log(_challengeDetails);

        const challengeDetailsNew = {
          objective: _challengeDetailsUpdated[0],
          targetMiles: _challengeDetailsUpdated[1],
          NoOfWeeks: _challengeDetailsUpdated[2],
          failedWeeks: _challengeDetailsUpdated[3],
          isLive: _challengeDetailsUpdated[4],
          competitionDeadline: _challengeDetailsUpdated[5],
          currentIntervalEpoch: _challengeDetailsUpdated[6],
          nextIntervalEpoch: _challengeDetailsUpdated[7],
          defaultAddress: _challengeDetailsUpdated[8],
        };

        console.log("challengeDetailsNew", challengeDetailsNew);
      }

      //check if challenge is over
      if (challengeDetails.competitionDeadline <= currentEpoch) {
        //evaluate how much is to be sent to defaul address
        const ethToDefault = userDetails.currenStaked / challengeDetails.failedWeeks;

        await chainHabits.handleCompleteChallenge(challengeId, ethToDefault);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // for each live challenge handle review logic
  Address_liveChallenges.map(async user => {
    handleLogic(user);
  });

  async function getAthletesStravaData(challengeDetails, new_access_token) {
    try {
      console.log("Call Strava to get Miles Logged");
      const url = `https://www.strava.com/api/v3/athlete/activities?before=${challengeDetails.nextIntervalEpoch}&after=1688235075&page=1&per_page=30`;
      const response = await axios.get(url, {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${new_access_token}`,
        },
      });

      const data = response.data;

      const filteredActivities = data.map(activity => {
        return {
          name: activity.name,
          distance: activity.distance,
          moving_time: activity.moving_time,
          total_elevation_gain: activity.total_elevation_gain,
          type: activity.type,
          start_date: activity.start_date,
          start_date_local: activity.start_date_local,
          workout_type: activity.workout_type,
        };
      });

      const arrayOfRuns = filteredActivities.filter(event => {
        return event.workout_type === 0;
      });

      console.log("@@arrayOfRuns", arrayOfRuns);

      const distanceLogged = arrayOfRuns.reduce((acc, event) => {
        return acc + parseInt(event.distance);
      }, 0);

      const distanceLoggedMiles = distanceLogged / 1609;

      console.log("meters logged:", distanceLoggedMiles);
      return distanceLoggedMiles;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }
}

main().catch(console.error);
