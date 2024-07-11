import { NextResponse } from "next/server";
import { NEXT_PUBLIC_STRAVA_CLIENT_ID, NEXT_PUBLIC_STRAVA_CLIENT_SECRET } from "../../../constants/index";
import { log } from "./logger";
import axios, { AxiosResponse } from "axios";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import chainHabits from "~~/contracts/deployedContracts";

// Types
type UserDetails = {
  currenStaked: number;
  userID: ethers.BigNumber;
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

type ChallengeLogEntry = {
  user: string;
  totalWeeks: number;
  startDate: Date;
  endDate: Date;
  currentWeek: number;
  isCompleted: boolean;
  intervalReviews: { week: number; success: boolean }[];
  lastProcessedBlock: number; // Add this new field
};

interface NewChallengeCreatedEvent {
  challengeId: ethers.BigNumber;
  user: string;
  NumberofWeeks: number;
  challengeStartDate: ethers.BigNumber;
}

interface IntervalReviewCompletedEvent {
  challengeId: ethers.BigNumber;
  userAddress: string;
  success: boolean;
}

interface ChallengeCompletedEvent {
  challengeId: ethers.BigNumber;
  userAddress: string;
  stakeForfeited: ethers.BigNumber;
}
// Constants
const CHAIN_ID = "84532";
const PROVIDER_URL = "https://base-sepolia.g.alchemy.com/v2/ZgfRDpN01Ven-A0XTYAmn9xclMbxV0ba";
const PRIVATE_KEY = "bf0c60264942544c1ecb566e558207f5d84d08bd66d524bbc7df9b92b9d6f946";

// Global variables
let provider: ethers.providers.JsonRpcProvider;
let chainHabitsContract: ethers.Contract;
let challengeLog: Map<string, ChallengeLogEntry>;

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
  console.log("@address", address);

  chainHabitsContract = new ethers.Contract(address, abi, signer);

  log("Provider and contract setup completed.");
}

// Main logic function
async function handleStravaLogic() {
  await setupProviderAndContract();

  const currentEpoch = Math.floor(Date.now() / 1000);
  const userAddressList = await chainHabitsContract.getAllUserDetails();

  if (!userAddressList || userAddressList.length === 0) {
    log("No users found.");
    return null;
  }
  log(`Found ${userAddressList.length} users.`);
  console.log("userAddressList", userAddressList);

  const addressLiveChallenges = await getLiveChallenges(userAddressList);

  if (addressLiveChallenges.length === 0) {
    log("No live challenges found.");
    return null;
  }
  log(`Found ${addressLiveChallenges.length} live challenges.`);
  console.log("addressLiveChallenges", addressLiveChallenges);

  // Build the challenge log
  challengeLog = await buildEventsLog();
  console.log("@@@Here");

  for (const userAddress of addressLiveChallenges) {
    await handleUserChallenge(userAddress, currentEpoch);
  }

  console.log("@@@Here2");

  // Save the updated challenge log
  saveEventsLog(challengeLog);

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
  const _userDetails: [number, ethers.BigNumber, string, number, ethers.BigNumber, string] =
    await chainHabitsContract.getUserDetails(userAddress);

  if (!_userDetails) {
    log("user details not found for");
    return "userDetails not found";
  }

  console.log("@@@@_userDetails", _userDetails);

  const [currentStaked, userID, refreshToken, , ,] = _userDetails as [
    number,
    ethers.BigNumber,
    string,
    number,
    ethers.BigNumber,
    string,
  ];

  const userDetails: UserDetails = {
    currenStaked: currentStaked,
    userID: userID,
    refreshToken: refreshToken,
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
    console.log("access_token", new_access_token);

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

    if (new_refresh_token !== userDetails.refreshToken) {
      await updateRefreshToken(userAddress, new_refresh_token);
    }

    const challengeLogEntry = challengeLog.get(challengeId.toString());
    console.log("@@review if review interval is due");
    console.log("@@challengeLogEntry", challengeLogEntry);
    console.log("@@intervalreviewlength", challengeLogEntry?.intervalReviews.length);
    // if (challengeLogEntry && challengeLogEntry.currentWeek > challengeLogEntry.intervalReviews.length + 1) {
    //   await _handleIntervalReview(challengeId, challengeDetails, new_access_token);
    // }

    //TESTING PURPPOSES ONLY
    await _handleIntervalReview(challengeId, challengeDetails, new_access_token);

    if (challengeDetails.competitionDeadline <= currentEpoch) {
      console.log("handle complete challenge logic");
      await handleCompleteChallenge(challengeId, userDetails, challengeDetails, userAddress);

      log(`Successfully handled challenge for user ${userAddress}`);
    }
  } catch (e) {
    log(`Error handling challenge for user ${userAddress}: ${e}`);
    console.error(e);
  }
}

async function _handleIntervalReview(
  challengeId: string,
  challengeDetails: ChallengeDetails,
  new_access_token: string,
) {
  try {
    let distanceLogged = await getAthletesStravaData(challengeDetails, new_access_token);
    distanceLogged += 15;

    const isTargetMet: boolean = distanceLogged >= challengeDetails.targetMiles;

    const tx = await chainHabitsContract.handleIntervalReview(challengeId, isTargetMet);

    await tx.wait();

    // Update the challenge log
    const challengeLogEntry = challengeLog.get(challengeId);
    if (challengeLogEntry) {
      challengeLogEntry.intervalReviews.push({ week: challengeLogEntry.currentWeek, success: isTargetMet });
      challengeLogEntry.currentWeek++;
    }
    log(`Successfully handled interval review for challenge ${challengeId}`);
  } catch (e) {
    log(`Error handling interval review for challenge ${challengeId}: ${e}`);
  }
}

async function handleCompleteChallenge(
  challengeId: string,
  userDetails: UserDetails,
  challengeDetails: ChallengeDetails,
  userAddress: string,
) {
  try {
    const ethToDefault =
      (BigInt(userDetails.currenStaked) / BigInt(challengeDetails.NoOfWeeks)) * BigInt(challengeDetails.failedWeeks);
    if (ethToDefault > userDetails.currenStaked) {
      return "logic error - Cannot send more Eth to default than what is staked";
    }
    console.log("@@@currentstaked", userDetails.currenStaked);
    await chainHabitsContract.handleCompleteChallenge(challengeId, ethToDefault, userAddress);

    // Update the challenge log
    const challengeLogEntry = challengeLog.get(challengeId);
    if (challengeLogEntry) {
      challengeLogEntry.isCompleted = true;
    }
    log(`Successfully completed challenge ${challengeId} for user ${userAddress}`);
  } catch (e) {
    log(`Error completing challenge ${challengeId} for user ${userAddress}: ${e}`);
  }
}

async function updateRefreshToken(userAddress: string, new_refresh_token: string) {
  try {
    await chainHabitsContract.updateRefreshToken(userAddress, new_refresh_token);
    log(`Successfully updated refresh token for user ${userAddress}`);
  } catch (e) {
    log(`Error updating refresh token for user ${userAddress}: ${e}`);
  }
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
    log(`Successfully retrieved Strava data for challenge`);

    const distanceLogged = 0;
    return distanceLogged;
  } catch (e) {
    console.error(e);
    log(`Error retrieving Strava data: ${e}`);
    return 0;
  }
}

// Improved event logging functions

async function buildEventsLog(): Promise<Map<string, ChallengeLogEntry>> {
  const logPath = path.join(process.cwd(), "logs", "events_log.json");
  let challengeLog: Map<string, ChallengeLogEntry>;

  if (fs.existsSync(logPath)) {
    console.log;
    // Load existing log
    const logData = fs.readFileSync(logPath, "utf8");
    const parsedData = JSON.parse(logData);
    challengeLog = new Map(Object.entries(parsedData));

    // Get the latest processed block from the existing log
    const startBlock = (await provider.getBlockNumber()) - 10000;

    // Fetch and process new events since the last processed block
    const newEvents = await fetchNewEvents(startBlock);
    challengeLog = processNewEvents(challengeLog, newEvents);
  } else {
    // If no log exists, build from scratch
    challengeLog = await handleBuildLogs();
  }

  return challengeLog;
}

async function fetchNewEvents(fromBlock: number): Promise<ethers.Event[]> {
  const latestBlock = await provider.getBlockNumber();
  // const eventNames = ["NewChallengeCreated", "intervalReviewCompleted", "ChallengeCompleted"];
  const events: ethers.Event[] = await chainHabitsContract.queryFilter("*", fromBlock + 1, latestBlock);
  // let allEvents: ethers.Event[] = [];
  // for (const event in eventNames) {
  //   const events = await chainHabitsContract.queryFilter(event, resolvedFromBlock + 1, latestBlock);
  //   allEvents = allEvents.concat(events);
  // }
  // console.log("@@@@fetchNewEvents", fetchNewEvents);
  return events;
}

function processNewEvents(
  challengeLog: Map<string, ChallengeLogEntry>,
  newEvents: ethers.Event[],
): Map<string, ChallengeLogEntry> {
  for (const event of newEvents) {
    if (event.event === "NewChallengeCreated" && event.args) {
      const args = event.args as unknown as NewChallengeCreatedEvent;

      const [challengeId, user, , NumberofWeeks, , challengeStartDate, forfeitAddress] = event.args as [
        ethers.BigNumber,
        string,
        any,
        number,
        any,
        number,
        string,
      ];
      const endDateEpoch = challengeStartDate * 604800;

      challengeLog.set(challengeId.toString(), {
        user: user,
        totalWeeks: NumberofWeeks,
        startDate: new Date(challengeStartDate * 1000),
        endDate: new Date(endDateEpoch * 1000),
        currentWeek: 1,
        isCompleted: false,
        intervalReviews: [],
        lastProcessedBlock: event.blockNumber,
      });
    } else if (event.event === "intervalReviewCompleted" && event.args) {
      const [challengeId, success] = event.args as [ethers.BigNumber, boolean];
      const challenge = challengeLog.get(challengeId.toString());
      if (challenge) {
        challenge.intervalReviews.push({ week: challenge.currentWeek, success: success });
        challenge.currentWeek++;
        challenge.lastProcessedBlock = event.blockNumber;
      }
    } else if (event.event === "ChallengeCompleted" && event.args) {
      const [challengeId] = event.args as [ethers.BigNumber];
      const challenge = challengeLog.get(challengeId.toString());
      if (challenge) {
        challenge.isCompleted = true;
        challenge.lastProcessedBlock = event.blockNumber;
      }
    }
  }

  return challengeLog;
}

//Build the logs first time this code is triggered or when there is no events_log.json found
async function handleBuildLogs(): Promise<Map<string, ChallengeLogEntry>> {
  const eventNames = ["NewChallengeCreated", "intervalReviewCompleted", "ChallengeCompleted"];
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latestBlock - 10000);

  const allEvents = await chainHabitsContract.queryFilter("*", fromBlock, latestBlock);

  const relevantEvents = allEvents
    .filter((event): event is ethers.Event => typeof event.event === "string" && eventNames.includes(event.event))
    .sort((a, b) => a.blockNumber - b.blockNumber);

  const challengeLog: Map<string, ChallengeLogEntry> = new Map();

  for (const event of relevantEvents) {
    if (event.event === "NewChallengeCreated" && event.args) {
      const args = event.args as unknown as NewChallengeCreatedEvent;
      const [challengeId, user, , NumberofWeeks, , challengeStartDate, forfeitAddress] = event.args as [
        ethers.BigNumber,
        string,
        any,
        number,
        any,
        number,
        string,
      ];

      const endDateEpoch = challengeStartDate * 604800;

      challengeLog.set(challengeId.toString(), {
        user: user,
        totalWeeks: NumberofWeeks,
        startDate: new Date(challengeStartDate * 1000),
        endDate: new Date(endDateEpoch * 1000),
        currentWeek: 1,
        isCompleted: false,
        intervalReviews: [],
        lastProcessedBlock: event.blockNumber,
      });
    } else if (event.event === "intervalReviewCompleted" && event.args) {
      const [challengeId, success] = event.args as [ethers.BigNumber, boolean];
      const challenge = challengeLog.get(challengeId.toString());
      if (challenge) {
        challenge.intervalReviews.push({ week: challenge.currentWeek, success: success });
        challenge.currentWeek++;
        challenge.lastProcessedBlock = event.blockNumber;
      }
    } else if (event.event === "ChallengeCompleted" && event.args) {
      const [challengeId] = event.args as [ethers.BigNumber];
      const challenge = challengeLog.get(challengeId.toString());
      if (challenge) {
        challenge.isCompleted = true;
        challenge.lastProcessedBlock = event.blockNumber;
      }
    }
  }

  // Calculate current week for active challenges
  const currentTimestamp = Math.floor(Date.now() / 1000);
  for (const challenge of challengeLog.values()) {
    if (!challenge.isCompleted) {
      const elapsedWeeks = Math.floor((currentTimestamp - challenge.startDate.getTime() / 1000) / (7 * 24 * 60 * 60));
      challenge.currentWeek = Math.min(elapsedWeeks + 1, challenge.totalWeeks);
    }
  }

  return challengeLog;
}

function saveEventsLog(challengeLog: Map<string, ChallengeLogEntry>) {
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logPath = path.join(logDir, "events_log.json");
  const logData = JSON.stringify(Object.fromEntries(challengeLog), null, 2);

  fs.writeFileSync(logPath, logData);
}
