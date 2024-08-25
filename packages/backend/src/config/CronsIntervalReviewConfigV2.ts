import { gql, Client, cacheExchange, fetchExchange } from "@urql/core";
import axios, { AxiosResponse } from "axios";
import { error } from "console";
import { ethers } from "ethers";
import { Request, Response } from "express";
import { zeroAddress } from "viem";
import chainHabits from "../contracts/deployedContracts";
import { Challenge, User } from "../interfaces";
import constants from "../utils/constants";
import cron from "node-cron";

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = constants;

// Constants
const CHAIN_ID = "31337";
// const PROVIDER_URL = "https://base-sepolia.g.alchemy.com/v2/ZgfRDpN01Ven-A0XTYAmn9xclMbxV0ba";
const PROVIDER_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY =
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const SUBGRAPH_URL =
  "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract"; // Update with your subgraph URL

// Global variables
let provider: ethers.JsonRpcProvider;
let chainHabitsContract: ethers.Contract;
let challengeLog: Map<string, Challenge>;

// Apollo Client setup
const client = new Client({
  url: SUBGRAPH_URL,
  exchanges: [cacheExchange, fetchExchange],
});

// GraphQL Queries
const LIVE_CHALLENGES_DUE_FOR_REVIEW = gql`
  query {
    challenges(where: { status: true }) {
      id
      challengeId
      user {
        id
        userAddress
        stakedAmount
        status
        createdAt
        updatedAt
        transactionHash
      }
      userAddress
      objective
      startingMiles
      numberOfWeeks
      stakedAmount
      defaultAddress
      success
      status
      failedWeeks
      createdAt
      updatedAt
      transactionHash
      competitionDeadline
      nextIntervalReviewEpoch
      intervalReviewTally
      ERC20Address
      weeklyTargetIncreasePercentage
    }
  }
`;

const USER_DETAILS = gql`
  query getUserDetails($userAddress: String!) {
    user(id: $userAddress) {
      id
      userAddress
      stakedAmount
      status
      createdAt
      updatedAt
      transactionHash
    }
  }
`;
export default async function StartIntervalReview() {
  const cronSchedule = "0 22 * * *";
  const task = cron.schedule(cronSchedule, handleStravaLogic);
  task.start();
}
// Main function
export async function Main(req: Request, res: Response) {
  try {
    const response = await handleStravaLogic();
    if (!response) return res.status(404).json({});

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error handling the request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function setupProviderAndContract() {
  provider = new ethers.JsonRpcProvider(PROVIDER_URL);

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

  // Query subgraph for live challenges where next interval review is due
  const { data } = await client
    .query(LIVE_CHALLENGES_DUE_FOR_REVIEW, {})
    .toPromise();

  const liveChallenges: Challenge[] = data.challenges;

  if (liveChallenges.length === 0) {
    console.log("No live challenges found.");
    return null;
  }

  // Build the challenge log from the subgraph data
  challengeLog = new Map();
  liveChallenges.forEach((challenge: Challenge) => {
    challengeLog.set(challenge.id, challenge);
  });

  for (const [challengeId, challengeEntry] of challengeLog.entries()) {
    await handleUserChallenge(
      challengeEntry.user.userAddress,
      currentEpoch,
      challengeId
    );
  }

  return { success: true };
}

// Helper functions
async function handleUserChallenge(
  userAddress: string,
  currentEpoch: number,
  challengeId: string
) {
  const { data } = await client
    .query(USER_DETAILS, { userAddress })
    .toPromise();

  const userDetails: User = data.user;
  const challengeLogEntry: Challenge | undefined =
    challengeLog.get(challengeId);

  console.log("@@@@challengeLogEntry", challengeLogEntry);

  if (!challengeLogEntry) {
    console.error(`Challenge ${challengeId} not found in challengeLog`);
    return { success: false };
  }

  const userContractDetails = await chainHabitsContract.getUserDetails(
    userAddress
  );

  const refreshToken = userContractDetails[2];

  const stravaCallData = {
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };

  try {
    const response: AxiosResponse = await axios.post(
      "https://www.strava.com/oauth/token",
      stravaCallData
    );
    const { access_token: new_access_token, refresh_token: new_refresh_token } =
      response.data;

    if (new_refresh_token !== refreshToken) {
      await updateRefreshToken(userAddress, new_refresh_token);
    }

    if (challengeLogEntry && currentEpoch > Number(1720773628)) {
      await _handleIntervalReview(
        challengeId,
        challengeLogEntry,
        new_access_token,
        userAddress
      );
    } else {
      const NextIntervalDate = Number(
        challengeLogEntry.nextIntervalReviewEpoch
      );
      console.log("@@@next interval not due yet", NextIntervalDate);
    }

    if (Number(challengeLogEntry.competitionDeadline) <= currentEpoch) {
      await handleCompleteChallenge(
        challengeId,
        userDetails,
        challengeLogEntry,
        userAddress
      );
    }
  } catch (e) {
    console.error(`Error handling challenge for user ${userAddress}: ${e}`);
    return { success: false };
  }
}

async function _handleIntervalReview(
  challengeId: string,
  challengeDetails: Challenge,
  new_access_token: string,
  userAddress: string
) {
  //TODO: should take into account the targetincrease?
  try {
    let distanceLogged = await getAthletesStravaData(
      challengeDetails,
      new_access_token
    );
    if (distanceLogged) {
      distanceLogged += 15; // Placeholder value
      console.log("distanceLogged", distanceLogged);
      const isTargetMet: boolean =
        distanceLogged >= challengeDetails.startingMiles; // Assuming startingMiles is the target
      console.log("isTargetMet", isTargetMet);
      const tx = await chainHabitsContract.handleIntervalReview(
        challengeId,
        userAddress,
        isTargetMet
      );

      await tx.wait();
    } else {
      return;
    }
  } catch (e) {
    console.error(
      `Error handling interval review for challenge ${challengeId}: ${e}`
    );
  }
}

async function handleCompleteChallenge(
  challengeId: string,
  userDetails: User,
  challengeDetails: Challenge,
  userAddress: string
) {
  //If deposit is in ETH
  if (challengeDetails.ERC20Address == zeroAddress) {
    try {
      const ethToDefault =
        (BigInt(userDetails.stakedAmount) /
          BigInt(challengeDetails.numberOfWeeks)) *
        BigInt(challengeDetails.failedWeeks);
      if (ethToDefault > BigInt(userDetails.stakedAmount)) {
        return "logic error - Cannot send more Eth to default than what is staked";
      }

      await chainHabitsContract.handleCompleteChallengeETH(
        challengeId,
        ethToDefault,
        userAddress,
        zeroAddress
      );
    } catch (e) {
      console.error(
        `Error completing challenge ${challengeId} for user ${userAddress}: ${e}`
      );
    }
  } else {
    try {
      const tokenToForfeit =
        (BigInt(userDetails.stakedAmount) /
          BigInt(challengeDetails.numberOfWeeks)) *
        BigInt(challengeDetails.failedWeeks);
      if (tokenToForfeit > BigInt(userDetails.stakedAmount)) {
        return "logic error - Cannot send more Tokens to default than what is staked";
      }

      await chainHabitsContract.handleCompleteChallengeERC20(
        challengeId,
        tokenToForfeit,
        userAddress,
        challengeDetails.ERC20Address
      );
    } catch (e) {
      console.error(
        `Error completing challenge ${challengeId} for user ${userAddress}: ${e}`
      );
    }
  }
}

async function updateRefreshToken(
  userAddress: string,
  new_refresh_token: string
) {
  try {
    await chainHabitsContract.updateRefreshToken(
      userAddress,
      new_refresh_token
    );
  } catch (e) {
    console.error(`Error updating refresh token for user ${userAddress}: ${e}`);
  }
}

async function getAthletesStravaData(
  challengeDetails: Challenge,
  new_access_token: string
) {
  const beforeEpoch = challengeDetails.nextIntervalReviewEpoch;
  const afterEpoch = Number(challengeDetails.nextIntervalReviewEpoch) - 6048000; // One week before the `nextIntervalReviewEpoch`
  try {
    const url = `https://www.strava.com/api/v3/athlete/activities?before=${beforeEpoch}&after=${afterEpoch}&page=1&per_page=30`; // Adjust if needed

    const response: AxiosResponse = await axios.get(url, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${new_access_token}`,
      },
    });

    const allActivity: any[] = response.data;

    const OnlyRuns = allActivity.filter((activity: any) => {
      return activity.type === "Run";
    });

    // Accumulate distance
    const distanceLogged = OnlyRuns.reduce(
      (accDistance: number, activity: any) => {
        return accDistance + activity.distance;
      },
      0
    );

    return distanceLogged;
  } catch (e) {
    console.error(`Error retrieving Strava data: ${e}`);
    return error(`Error retrieving Strava data: ${e}`);
  }
}

// -------------------------OLD Strava call from NEXT-JS---------------------------
// import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
// import axios, { AxiosResponse } from "axios";
// import { error } from "console";
// import { ethers } from "ethers";
// import { Request, Response } from "express";
// import { zeroAddress } from "viem";
// import chainHabits from "~~/contracts/deployedContracts";
// import { Challenge, User } from "~~/interfaces";
// import constants from "~~/utils/constants";
// import cron from "node-cron";

// const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = constants;

// // Constants
// const CHAIN_ID = "31337";
// // const PROVIDER_URL = "https://base-sepolia.g.alchemy.com/v2/ZgfRDpN01Ven-A0XTYAmn9xclMbxV0ba";
// const PROVIDER_URL = "http://127.0.0.1:8545";
// const PRIVATE_KEY =
//   "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// const SUBGRAPH_URL =
//   "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract"; // Update with your subgraph URL

// // Global variables
// let provider: ethers.JsonRpcProvider;
// let chainHabitsContract: ethers.Contract;
// let challengeLog: Map<string, Challenge>;

// // Apollo Client setup
// const client = new ApolloClient({
//   uri: SUBGRAPH_URL,
//   cache: new InMemoryCache(),
// });

// // GraphQL Queries
// const LIVE_CHALLENGES_DUE_FOR_REVIEW = gql`
//   query {
//     challenges(where: { status: true }) {
//       id
//       challengeId
//       user {
//         id
//         userAddress
//         stakedAmount
//         status
//         createdAt
//         updatedAt
//         transactionHash
//       }
//       userAddress
//       objective
//       startingMiles
//       numberOfWeeks
//       stakedAmount
//       defaultAddress
//       success
//       status
//       failedWeeks
//       createdAt
//       updatedAt
//       transactionHash
//       competitionDeadline
//       nextIntervalReviewEpoch
//       intervalReviewTally
//       ERC20Address
//       weeklyTargetIncreasePercentage
//     }
//   }
// `;

// const USER_DETAILS = gql`
//   query getUserDetails($userAddress: String!) {
//     user(id: $userAddress) {
//       id
//       userAddress
//       stakedAmount
//       status
//       createdAt
//       updatedAt
//       transactionHash
//     }
//   }
// `;
// export default async function StartIntervalReview() {
//   const cronSchedule = "0 22 * * *";
//   const task = cron.schedule(cronSchedule, handleStravaLogic);
//   task.start();
// }
// // Main function
// export async function Main(req: Request, res: Response) {
//   try {
//     const response = await handleStravaLogic();
//     if (!response) return res.status(404).json({});

//     return res.status(200).json(response);
//   } catch (error) {
//     console.error("Error handling the request:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// async function setupProviderAndContract() {
//   provider = new ethers.JsonRpcProvider(PROVIDER_URL);

//   const network = await provider.getNetwork();
//   console.log("Connected to network:", network);

//   const wallet = new ethers.Wallet(PRIVATE_KEY);
//   const signer = wallet.connect(provider);

//   const abi = chainHabits[CHAIN_ID]["ChainHabits"].abi;
//   const address = chainHabits[CHAIN_ID]["ChainHabits"].address;

//   chainHabitsContract = new ethers.Contract(address, abi, signer);
// }

// // Main logic function
// async function handleStravaLogic() {
//   await setupProviderAndContract();

//   const currentEpoch = Math.floor(Date.now() / 1000);

//   // Query subgraph for live challenges where next interval review is due
//   const { data } = await client.query({
//     query: LIVE_CHALLENGES_DUE_FOR_REVIEW,
//   });

//   const liveChallenges: Challenge[] = data.challenges;

//   if (liveChallenges.length === 0) {
//     console.log("No live challenges found.");
//     return null;
//   }

//   // Build the challenge log from the subgraph data
//   challengeLog = new Map();
//   liveChallenges.forEach((challenge: Challenge) => {
//     challengeLog.set(challenge.id, challenge);
//   });

//   for (const [challengeId, challengeEntry] of challengeLog.entries()) {
//     await handleUserChallenge(
//       challengeEntry.user.userAddress,
//       currentEpoch,
//       challengeId
//     );
//   }

//   return { success: true };
// }

// // Helper functions
// async function handleUserChallenge(
//   userAddress: string,
//   currentEpoch: number,
//   challengeId: string
// ) {
//   const { data } = await client.query({
//     query: USER_DETAILS,
//     variables: { userAddress },
//   });

//   const userDetails: User = data.user;
//   const challengeLogEntry: Challenge | undefined =
//     challengeLog.get(challengeId);

//   console.log("@@@@challengeLogEntry", challengeLogEntry);

//   if (!challengeLogEntry) {
//     console.error(`Challenge ${challengeId} not found in challengeLog`);
//     return { success: false };
//   }

//   const userContractDetails = await chainHabitsContract.getUserDetails(
//     userAddress
//   );

//   const refreshToken = userContractDetails[2];

//   const stravaCallData = {
//     client_id: STRAVA_CLIENT_ID,
//     client_secret: STRAVA_CLIENT_SECRET,
//     grant_type: "refresh_token",
//     refresh_token: refreshToken,
//   };

//   try {
//     const response: AxiosResponse = await axios.post(
//       "https://www.strava.com/oauth/token",
//       stravaCallData
//     );
//     const { access_token: new_access_token, refresh_token: new_refresh_token } =
//       response.data;

//     if (new_refresh_token !== refreshToken) {
//       await updateRefreshToken(userAddress, new_refresh_token);
//     }

//     if (challengeLogEntry && currentEpoch > Number(1720773628)) {
//       await _handleIntervalReview(
//         challengeId,
//         challengeLogEntry,
//         new_access_token,
//         userAddress
//       );
//     } else {
//       const NextIntervalDate = Number(
//         challengeLogEntry.nextIntervalReviewEpoch
//       );
//       console.log("@@@next interval not due yet", NextIntervalDate);
//     }

//     if (Number(challengeLogEntry.competitionDeadline) <= currentEpoch) {
//       await handleCompleteChallenge(
//         challengeId,
//         userDetails,
//         challengeLogEntry,
//         userAddress
//       );
//     }
//   } catch (e) {
//     console.error(`Error handling challenge for user ${userAddress}: ${e}`);
//     return { success: false };
//   }
// }

// async function _handleIntervalReview(
//   challengeId: string,
//   challengeDetails: Challenge,
//   new_access_token: string,
//   userAddress: string
// ) {
//   //TODO: should take into account the targetincrease?
//   try {
//     let distanceLogged = await getAthletesStravaData(
//       challengeDetails,
//       new_access_token
//     );
//     if (distanceLogged) {
//       distanceLogged += 15; // Placeholder value
//       console.log("distanceLogged", distanceLogged);
//       const isTargetMet: boolean =
//         distanceLogged >= challengeDetails.startingMiles; // Assuming startingMiles is the target
//       console.log("isTargetMet", isTargetMet);
//       const tx = await chainHabitsContract.handleIntervalReview(
//         challengeId,
//         userAddress,
//         isTargetMet
//       );

//       await tx.wait();
//     } else {
//       return;
//     }
//   } catch (e) {
//     console.error(
//       `Error handling interval review for challenge ${challengeId}: ${e}`
//     );
//   }
// }

// async function handleCompleteChallenge(
//   challengeId: string,
//   userDetails: User,
//   challengeDetails: Challenge,
//   userAddress: string
// ) {
//   //If deposit is in ETH
//   if (challengeDetails.ERC20Address == zeroAddress) {
//     try {
//       const ethToDefault =
//         (BigInt(userDetails.stakedAmount) /
//           BigInt(challengeDetails.numberOfWeeks)) *
//         BigInt(challengeDetails.failedWeeks);
//       if (ethToDefault > BigInt(userDetails.stakedAmount)) {
//         return "logic error - Cannot send more Eth to default than what is staked";
//       }

//       await chainHabitsContract.handleCompleteChallengeETH(
//         challengeId,
//         ethToDefault,
//         userAddress,
//         zeroAddress
//       );
//     } catch (e) {
//       console.error(
//         `Error completing challenge ${challengeId} for user ${userAddress}: ${e}`
//       );
//     }
//   } else {
//     try {
//       const tokenToForfeit =
//         (BigInt(userDetails.stakedAmount) /
//           BigInt(challengeDetails.numberOfWeeks)) *
//         BigInt(challengeDetails.failedWeeks);
//       if (tokenToForfeit > BigInt(userDetails.stakedAmount)) {
//         return "logic error - Cannot send more Tokens to default than what is staked";
//       }

//       await chainHabitsContract.handleCompleteChallengeERC20(
//         challengeId,
//         tokenToForfeit,
//         userAddress,
//         challengeDetails.ERC20Address
//       );
//     } catch (e) {
//       console.error(
//         `Error completing challenge ${challengeId} for user ${userAddress}: ${e}`
//       );
//     }
//   }
// }

// async function updateRefreshToken(
//   userAddress: string,
//   new_refresh_token: string
// ) {
//   try {
//     await chainHabitsContract.updateRefreshToken(
//       userAddress,
//       new_refresh_token
//     );
//   } catch (e) {
//     console.error(`Error updating refresh token for user ${userAddress}: ${e}`);
//   }
// }

// async function getAthletesStravaData(
//   challengeDetails: Challenge,
//   new_access_token: string
// ) {
//   const beforeEpoch = challengeDetails.nextIntervalReviewEpoch;
//   const afterEpoch = Number(challengeDetails.nextIntervalReviewEpoch) - 6048000; // One week before the `nextIntervalReviewEpoch`
//   try {
//     const url = `https://www.strava.com/api/v3/athlete/activities?before=${beforeEpoch}&after=${afterEpoch}&page=1&per_page=30`; // Adjust if needed

//     const response: AxiosResponse = await axios.get(url, {
//       headers: {
//         accept: "application/json",
//         authorization: `Bearer ${new_access_token}`,
//       },
//     });

//     const allActivity: any[] = response.data;

//     const OnlyRuns = allActivity.filter((activity: any) => {
//       return activity.type === "Run";
//     });

//     // Accumulate distance
//     const distanceLogged = OnlyRuns.reduce(
//       (accDistance: number, activity: any) => {
//         return accDistance + activity.distance;
//       },
//       0
//     );

//     return distanceLogged;
//   } catch (e) {
//     console.error(`Error retrieving Strava data: ${e}`);
//     return error(`Error retrieving Strava data: ${e}`);
//   }
// }
// ---------------------------------------------------------------------
