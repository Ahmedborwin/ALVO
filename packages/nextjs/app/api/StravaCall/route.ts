import { NextResponse } from "next/server";
import { NEXT_PUBLIC_STRAVA_CLIENT_ID, NEXT_PUBLIC_STRAVA_CLIENT_SECRET } from "../../../constants/index";
import axios, { AxiosResponse } from "axios";
import { ethers } from "ethers";
import chainHabits from "~~/contracts/deployedContracts";

// Types
type UserDetails = {
  challengeTally: bigint;
  SuccessfulChallenges: bigint;
  currenStaked: bigint;
  totalForeited: bigint;
  userID: bigint;
  refreshToken: string;
};

type ChallengeDetails = {
  objective: string;
  targetMiles: number;
  NoOfWeeks: number;
  failedWeeks: number;
  isLive: boolean;
  competitionDeadline: bigint;
  currentIntervalEpoch: bigint;
  nextIntervalEpoch: bigint;
  defaultAddress: string;
};

// Constants
const CHAIN_ID = "84532";
const PROVIDER_URL = "https://base-sepolia.g.alchemy.com/v2/ZgfRDpN01Ven-A0XTYAmn9xclMbxV0ba";
const PRIVATE_KEY = "bf0c60264942544c1ecb566e558207f5d84d08bd66d524bbc7df9b92b9d6f946";

// Global variables
let provider: ethers.providers.JsonRpcProvider;
let chainHabitsContract: ethers.Contract;

// Main function
export async function GET() {
  try {
    const response = await handleStravaLogic();
    if (!response) {
      return NextResponse.json({}, { status: 404 });
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling the request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Setup function
async function setupProviderAndContract() {
  provider = new ethers.providers.JsonRpcProvider({
    skipFetchSetup: true,
    url: PROVIDER_URL,
  });

  const network = await provider.getNetwork();
  console.log("Connected to network:", network);

  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const signer = wallet.connect(provider);

  const abi = chainHabits[CHAIN_ID]["ChainHabits"].abi;
  const address = chainHabits[CHAIN_ID]["ChainHabits"].address;

  chainHabitsContract = new ethers.Contract(address, abi, signer);
}

// Main logic function
async function handleStravaLogic() {
  await setupProviderAndContract();

  const currentEpoch = Math.floor(Date.now() / 1000);
  const userAddressList = await chainHabitsContract.getAllUserDetails();

  if (!userAddressList || userAddressList.length === 0) {
    return null;
  }

  console.log("userAddressList", userAddressList);

  const addressLiveChallenges = await getLiveChallenges(userAddressList);

  if (addressLiveChallenges.length === 0) {
    return null;
  }

  console.log("addressLiveChallenges", addressLiveChallenges);

  for (const userAddress of addressLiveChallenges) {
    await handleUserChallenge(userAddress, currentEpoch);
  }

  return { success: true };
}

// Helper functions
async function getLiveChallenges(userAddressList: string[]): Promise<string[]> {
  const liveChallenges = await Promise.all(
    userAddressList.map(async userAddress => {
      const foundLiveChallenge = await chainHabitsContract.userHasLiveChallenge(userAddress);
      return foundLiveChallenge ? userAddress : null;
    }),
  );

  return liveChallenges.filter(userAddress => userAddress !== null) as string[];
}

async function handleUserChallenge(userAddress: string, currentEpoch: number) {
  const _userDetails = await chainHabitsContract.getUserDetails(userAddress);

  if (!_userDetails) {
    return;
  }

  const userDetails: UserDetails = {
    challengeTally: _userDetails.challengeTally,
    SuccessfulChallenges: _userDetails.SuccessfulChallenges,
    currenStaked: _userDetails.currenStaked,
    totalForeited: _userDetails.totalDonated,
    userID: _userDetails.userID,
    refreshToken: _userDetails.refreshToken,
  };

  const stravaCallData = {
    client_id: NEXT_PUBLIC_STRAVA_CLIENT_ID,
    client_secret: NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: userDetails.refreshToken,
  };

  try {
    const response: AxiosResponse = await axios.post("https://www.strava.com/oauth/token", stravaCallData);
    const { access_token: new_access_token, refresh_token: new_refresh_token } = response.data;

    const challengeId = await chainHabitsContract.getChallengeId(userAddress);
    const _challengeDetails = await chainHabitsContract.getChallengeDetails(challengeId);

    if (!_challengeDetails) {
      return;
    }

    const challengeDetails: ChallengeDetails = {
      objective: _challengeDetails?.objective,
      targetMiles: _challengeDetails?.targetMiles,
      NoOfWeeks: _challengeDetails?.NoOfWeeks,
      failedWeeks: _challengeDetails?.failedWeeks,
      isLive: _challengeDetails?.isLive,
      competitionDeadline: _challengeDetails?.competitionDeadline,
      currentIntervalEpoch: _challengeDetails?.currentIntervalEpoch,
      nextIntervalEpoch: _challengeDetails?.nextIntervalEpoch,
      defaultAddress: _challengeDetails?.defaultAddress,
    };
    console.log("@@@challengeDetails", challengeDetails);

    if (new_refresh_token !== userDetails.refreshToken) {
      await updateRefreshToken(userAddress, new_refresh_token);
    }

    if (currentEpoch >= challengeDetails.nextIntervalEpoch) {
      await _handleIntervalReview(challengeId, challengeDetails, new_access_token);
    }

    if (challengeDetails.competitionDeadline <= currentEpoch) {
      console.log("handle complete challenge logic");
      await handleCompleteChallenge(challengeId, userDetails, challengeDetails, userAddress);
    }
  } catch (e) {
    console.error(e);
  }
}

async function _handleIntervalReview(
  challengeId: string,
  challengeDetails: ChallengeDetails,
  new_access_token: string,
) {
  let distanceLogged = await getAthletesStravaData(challengeDetails, new_access_token);
  distanceLogged += 15;
  // const nextIntervalEpoch: bigint = challengeDetails.currentIntervalEpoch + BigInt(60);

  const isTargetMet: boolean = distanceLogged < challengeDetails.targetMiles; //bool

  const tx = await chainHabitsContract.handleIntervalReview(challengeId, isTargetMet);

  await tx.wait();

  challengeDetails.failedWeeks += isTargetMet ? 1 : 0;
}

async function handleCompleteChallenge(
  challengeId: string,
  userDetails: UserDetails,
  challengeDetails: ChallengeDetails,
  userAddress: string,
) {
  const ethToDefault =
    (userDetails.currenStaked / BigInt(challengeDetails.NoOfWeeks)) * BigInt(challengeDetails.failedWeeks);
  if (ethToDefault > userDetails.currenStaked) {
    //TODO - how can I better handle errors?
    return "logic error";
  }
  await chainHabitsContract.handleCompleteChallenge(challengeId, ethToDefault, userAddress);
}

async function updateRefreshToken(userAddress: string, new_refresh_token: string) {
  await chainHabitsContract.updateRefreshToken(userAddress, new_refresh_token);
}

async function getAthletesStravaData(challengeDetails: ChallengeDetails, new_access_token: string) {
  try {
    const url = `https://www.strava.com/api/v3/athlete/activities?before=${challengeDetails.nextIntervalEpoch}&after=${challengeDetails.currentIntervalEpoch}&page=1&per_page=30`;
    const response: AxiosResponse = await axios.get(url, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${new_access_token}`,
      },
    });
    const distanceLogged = 0;
    return distanceLogged;
    // const data = response.data;
    // const filteredActivities = data.filter(activity => activity.workout_type === 0);
    // const distanceLogged = filteredActivities.reduce((acc: number, event) => acc + event.distance, 0);
    // console.log("@@@@distanceLogged", distanceLogged);
    // return distanceLogged / 1609;
  } catch (e) {
    console.error(e);
    return 0;
  }
}
