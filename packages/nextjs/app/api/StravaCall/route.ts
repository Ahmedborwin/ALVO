import { NextResponse } from "next/server";
// import axios, { AxiosResponse } from "axios";
import { ethers } from "ethers";
// import { NEXT_PUBLIC_STRAVA_CLIENT_ID, NEXT_PUBLIC_STRAVA_CLIENT_SECRET } from "~~/constants";
import chainHabits from "~~/contracts/deployedContracts";

// type UserDetails = {
//   challengeTally: bigint;
//   SuccessfulChallenges: bigint;
//   currenStaked: bigint;
//   totalForeited: bigint;
//   userID: bigint;
//   refreshToken: string;
// };

// type ChallengeDetails = {
//   objective: string;
//   targetMiles: number;
//   NoOfWeeks: number;
//   failedWeeks: number;
//   isLive: boolean;
//   competitionDeadline: bigint;
//   currentIntervalEpoch: bigint;
//   nextIntervalEpoch: bigint;
//   defaultAddress: string;
// };

// type StravaActivityObject = {
//   name: string;
//   distance: number;
//   workout_type: number;
// };

export async function POST(req: Request) {
  try {
    const { chainId } = await req.json();
    const response = await handleStravaLogic(chainId);

    if (!response) {
      return NextResponse.json({}, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling the request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
async function handleStravaLogic(chainId: string) {
  // const currentEpoch = Math.floor(Date.now() / 1000);
  console.log(chainId);

  const abi = chainHabits["84532"]["ChainHabits"].abi;
  const address = chainHabits["84532"]["ChainHabits"].address;

  const providerUrl = "https://eth-sepolia.g.alchemy.com/v2/U4KPgXJi3FAILfXVYloxhngoXfSLZnER";
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);

  // Test provider connection
  const network = await provider.getNetwork();
  console.log("Connected to network:", network);

  const wallet = new ethers.Wallet("bf0c60264942544c1ecb566e558207f5d84d08bd66d524bbc7df9b92b9d6f946");
  const signer = wallet.connect(provider);

  const chainHabitsContract = new ethers.Contract(address, abi, signer);

  const userAddressList = await chainHabitsContract.getAllUserDetails();

  if (!userAddressList || userAddressList.length === 0) {
    return null;
  }

  console.log("userAddressList", userAddressList);

  const Address_liveChallenges = await chainHabitsContract.getLiveChallenges(userAddressList);

  if (Address_liveChallenges.length === 0) {
    return null;
  }

  // await Promise.all(
  //   Address_liveChallenges.map(async userAddress => {
  //     await handleUserChallenge(userAddress, currentEpoch);
  //   }),
  // );

  return { success: true };
}

// async function getLiveChallenges(userAddressList: string[]): Promise<string[]> {
//   const _Address_liveChallenges = await Promise.all(
//     userAddressList.map(async userAddress => {
//       const foundLiveChallenge = await getScaffoldReadContract("ChainHabits", "userHasLiveChallenge", [userAddress]);
//       return foundLiveChallenge ? userAddress : null;
//     }),
//   );

//   return _Address_liveChallenges.filter(userAddress => userAddress !== null) as string[];
// }

// async function handleUserChallenge(userAddress: string, currentEpoch: number) {
//   const _userDetails = await getScaffoldReadContract("ChainHabits", "getUserDetails", [userAddress]);

//   if (!_userDetails) {
//     return;
//   }

//   const userDetails: UserDetails = {
//     challengeTally: _userDetails.challengeTally,
//     SuccessfulChallenges: _userDetails.SuccessfulChallenges,
//     currenStaked: _userDetails.currenStaked,
//     totalForeited: _userDetails.totalDonated,
//     userID: _userDetails.userID,
//     refreshToken: _userDetails.refreshToken,
//   };

//   const stravaCallData = {
//     client_id: NEXT_PUBLIC_STRAVA_CLIENT_ID,
//     client_secret: NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
//     grant_type: "refresh_token",
//     refresh_token: userDetails.refreshToken,
//   };

//   try {
//     const response: AxiosResponse = await axios.post("https://www.strava.com/oauth/token", stravaCallData);
//     const { access_token: new_access_token, refresh_token: new_refresh_token } = response.data;

//     const challengeId = await getScaffoldReadContract("ChainHabits", "getChallengeId", [userAddress]);
//     const _challengeDetails = await getScaffoldReadContract("ChainHabits", "getChallengeDetails", [challengeId]);

//     if (!_challengeDetails) {
//       return;
//     }

//     const challengeDetails: ChallengeDetails = {
//       objective: _challengeDetails?.objective,
//       targetMiles: _challengeDetails?.targetMiles,
//       NoOfWeeks: _challengeDetails?.NoOfWeeks,
//       failedWeeks: _challengeDetails?.failedWeeks,
//       isLive: _challengeDetails?.isLive,
//       competitionDeadline: _challengeDetails?.competitionDeadline,
//       currentIntervalEpoch: _challengeDetails?.currentIntervalEpoch,
//       nextIntervalEpoch: _challengeDetails?.nextIntervalEpoch,
//       defaultAddress: _challengeDetails?.defaultAddress,
//     };

//     if (new_refresh_token !== userDetails.refreshToken) {
//       await updateRefreshToken(userAddress, new_refresh_token);
//     }

//     if (currentEpoch >= challengeDetails.nextIntervalEpoch) {
//       await handleIntervalReview(challengeId, challengeDetails, new_access_token, currentEpoch);
//     }

//     if (challengeDetails.competitionDeadline <= currentEpoch) {
//       await handleCompleteChallenge(challengeId, userDetails, challengeDetails);
//     }
//   } catch (e) {
//     console.error(e);
//   }
// }

// async function handleIntervalReview(
//   challengeId: string,
//   challengeDetails: ChallengeDetails,
//   new_access_token: string,
//   currentEpoch: number,
// ) {
//   const distanceLogged = await getAthletesStravaData(challengeDetails, new_access_token);
//   const nextInterval = challengeDetails.currentIntervalEpoch + 604800;

//   const handleInterval = distanceLogged < challengeDetails.targetMiles;
//   await getScaffoldWriteContract("ChainHabits", "handleIntervalReview", [
//     challengeId,
//     handleInterval,
//     challengeDetails.nextIntervalEpoch,
//     nextInterval,
//   ]);

//   challengeDetails.failedWeeks += handleInterval ? 1 : 0;
// }

// async function handleCompleteChallenge(
//   challengeId: string,
//   userDetails: UserDetails,
//   challengeDetails: ChallengeDetails,
// ) {
//   const ethToDefault = userDetails.currenStaked / BigInt(challengeDetails.failedWeeks);
//   await getScaffoldWriteContract("ChainHabits", "handleCompleteChallenge", [challengeId, ethToDefault]);
// }

// async function updateRefreshToken(userAddress: string, new_refresh_token: string) {
//   await getScaffoldWriteContract("ChainHabits", "updateRefreshToken", [userAddress, new_refresh_token]);
// }

// async function getAthletesStravaData(challengeDetails: ChallengeDetails, new_access_token: string) {
//   try {
//     const url = `https://www.strava.com/api/v3/athlete/activities?before=${challengeDetails.nextIntervalEpoch}&after=${challengeDetails.currentIntervalEpoch}&page=1&per_page=30`;
//     const response: AxiosResponse = await axios.get(url, {
//       headers: {
//         accept: "application/json",
//         authorization: `Bearer ${new_access_token}`,
//       },
//     });

//     const data = response.data;
//     const filteredActivities = data.filter(activity => activity.workout_type === 0);
//     const distanceLogged = filteredActivities.reduce((acc: number, event) => acc + event.distance, 0);

//     return distanceLogged / 1609;
//   } catch (e) {
//     console.error(e);
//     return 0;
//   }
// }
