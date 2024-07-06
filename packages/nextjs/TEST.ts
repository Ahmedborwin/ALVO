// import axios, { AxiosResponse } from "axios";
// import { NextApiRequest, NextApiResponse } from "next";
// import { createPublicClient, createWalletClient, getContract, http } from "viem";
// import { baseSepolia, sepolia } from "viem/chains";
// import { NEXT_PUBLIC_STRAVA_CLIENT_ID, NEXT_PUBLIC_STRAVA_CLIENT_SECRET } from "~~/constants";
// import deployedContracts from "~~/contracts/deployedContracts";

// type UserDetails = {
//   challengeTally: bigint;
//   SuccessfulChallenges: bigint;
//   currenStaked: bigint;
//   totalForeited: bigint;
//   userID: bigint;
//   refreshToken: string;
// };

//NEW COMMENT

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

// export async function POST(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === "POST") {
//     try {
//       const { chainId } = req.body;
//       const response = await handleStravaLogic(chainId);

//       if (!response) {
//         return res.status(404).json({});
//       }

//       return res.status(200).json(response);
//     } catch (error) {
//       console.error("Error handling the request:", error);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   } else {
//     res.setHeader("Allow", ["POST"]);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
// async function handleStravaLogic(chainId: string) {
//   const currentEpoch = Math.floor(Date.now() / 1000);

//   const contractObject = deployedContracts["11155111"]["ChainHabits"];
//   const address = contractObject.address;

//   const abi = [
//     {
//       inputs: [],
//       stateMutability: "nonpayable",
//       type: "constructor",
//     },
//     {
//       inputs: [
//         {
//           internalType: "address",
//           name: "Caller",
//           type: "address",
//         },
//       ],
//       name: "CHAINHABITS__CallerNotAdmin",
//       type: "error",
//     },
//     {
//       inputs: [],
//       name: "CHAINHABITS__UserAlreadyRegistered",
//       type: "error",
//     },
//     {
//       inputs: [],
//       name: "CHAINHABITS__UserNotYetRegistered",
//       type: "error",
//     },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: false,
//           internalType: "uint256",
//           name: "challengeId",
//           type: "uint256",
//         },
//         {
//           indexed: false,
//           internalType: "string",
//           name: "Objective",
//           type: "string",
//         },
//         {
//           indexed: false,
//           internalType: "uint8",
//           name: "startingMiles",
//           type: "uint8",
//         },
//         {
//           indexed: false,
//           internalType: "uint8",
//           name: "NumberofWeeks",
//           type: "uint8",
//         },
//         {
//           indexed: false,
//           internalType: "uint48",
//           name: "competitionDeadline",
//           type: "uint48",
//         },
//         {
//           indexed: false,
//           internalType: "uint48",
//           name: "currentIntervalEpoch",
//           type: "uint48",
//         },
//         {
//           indexed: false,
//           internalType: "uint48",
//           name: "nextIntervalEpoch",
//           type: "uint48",
//         },
//         {
//           indexed: false,
//           internalType: "address",
//           name: "defaultAddress",
//           type: "address",
//         },
//       ],
//       name: "NewChallengeCreated",
//       type: "event",
//     },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: false,
//           internalType: "address",
//           name: "user",
//           type: "address",
//         },
//       ],
//       name: "NewUserRegistered",
//       type: "event",
//     },
//     {
//       inputs: [],
//       name: "admin",
//       outputs: [
//         {
//           internalType: "address",
//           name: "",
//           type: "address",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "uint256",
//           name: "",
//           type: "uint256",
//         },
//       ],
//       name: "allUsers",
//       outputs: [
//         {
//           internalType: "address",
//           name: "",
//           type: "address",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "string",
//           name: "_obj",
//           type: "string",
//         },
//         {
//           internalType: "uint8",
//           name: "_targetMiles",
//           type: "uint8",
//         },
//         {
//           internalType: "uint8",
//           name: "_weeks",
//           type: "uint8",
//         },
//         {
//           internalType: "address",
//           name: "_defaultAddress",
//           type: "address",
//         },
//       ],
//       name: "createNewChallenge",
//       outputs: [
//         {
//           internalType: "uint256",
//           name: "challengeId",
//           type: "uint256",
//         },
//       ],
//       stateMutability: "payable",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "getAllUserDetails",
//       outputs: [
//         {
//           internalType: "address[]",
//           name: "",
//           type: "address[]",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "uint256",
//           name: "_challengeId",
//           type: "uint256",
//         },
//       ],
//       name: "getChallengeDetails",
//       outputs: [
//         {
//           components: [
//             {
//               internalType: "string",
//               name: "objective",
//               type: "string",
//             },
//             {
//               internalType: "uint8",
//               name: "targetMiles",
//               type: "uint8",
//             },
//             {
//               internalType: "uint8",
//               name: "NoOfWeeks",
//               type: "uint8",
//             },
//             {
//               internalType: "uint8",
//               name: "failedWeeks",
//               type: "uint8",
//             },
//             {
//               internalType: "bool",
//               name: "isLive",
//               type: "bool",
//             },
//             {
//               internalType: "uint48",
//               name: "competitionDeadline",
//               type: "uint48",
//             },
//             {
//               internalType: "uint48",
//               name: "currentIntervalEpoch",
//               type: "uint48",
//             },
//             {
//               internalType: "uint48",
//               name: "nextIntervalEpoch",
//               type: "uint48",
//             },
//             {
//               internalType: "address",
//               name: "defaultAddress",
//               type: "address",
//             },
//           ],
//           internalType: "struct ChainHabits.ChallengeDetails",
//           name: "",
//           type: "tuple",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "address",
//           name: "_userAddress",
//           type: "address",
//         },
//       ],
//       name: "getChallengeId",
//       outputs: [
//         {
//           internalType: "uint256",
//           name: "",
//           type: "uint256",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "address",
//           name: "_user",
//           type: "address",
//         },
//       ],
//       name: "getUserDetails",
//       outputs: [
//         {
//           components: [
//             {
//               internalType: "uint256",
//               name: "challengeTally",
//               type: "uint256",
//             },
//             {
//               internalType: "uint256",
//               name: "SuccessfulChallenges",
//               type: "uint256",
//             },
//             {
//               internalType: "uint256",
//               name: "currenStaked",
//               type: "uint256",
//             },
//             {
//               internalType: "uint256",
//               name: "totalDonated",
//               type: "uint256",
//             },
//             {
//               internalType: "uint256",
//               name: "userID",
//               type: "uint256",
//             },
//             {
//               internalType: "string",
//               name: "refreshToken",
//               type: "string",
//             },
//           ],
//           internalType: "struct ChainHabits.UserDetails",
//           name: "",
//           type: "tuple",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "uint256",
//           name: "challengeId",
//           type: "uint256",
//         },
//         {
//           internalType: "uint256",
//           name: "_amountToDefault",
//           type: "uint256",
//         },
//       ],
//       name: "handleCompleteChallenge",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "uint256",
//           name: "_challengeId",
//           type: "uint256",
//         },
//         {
//           internalType: "bool",
//           name: "failed",
//           type: "bool",
//         },
//         {
//           internalType: "uint48",
//           name: "currentIntervalEpoch",
//           type: "uint48",
//         },
//         {
//           internalType: "uint48",
//           name: "nextIntervalEpoch",
//           type: "uint48",
//         },
//       ],
//       name: "handleIntervalReview",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "address",
//           name: "",
//           type: "address",
//         },
//       ],
//       name: "isUserRegisteredTable",
//       outputs: [
//         {
//           internalType: "bool",
//           name: "",
//           type: "bool",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "uint256",
//           name: "userID",
//           type: "uint256",
//         },
//         {
//           internalType: "string",
//           name: "_refreshToken",
//           type: "string",
//         },
//       ],
//       name: "registerNewUser",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "address",
//           name: "_user",
//           type: "address",
//         },
//         {
//           internalType: "string",
//           name: "_refreshToken",
//           type: "string",
//         },
//       ],
//       name: "updateRefreshToken",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [
//         {
//           internalType: "address",
//           name: "",
//           type: "address",
//         },
//       ],
//       name: "userHasLiveChallenge",
//       outputs: [
//         {
//           internalType: "bool",
//           name: "",
//           type: "bool",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "withdrawFunds",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//   ] as const;

//   // const chainHabits = contractObject.abi ;

//   const walletClient = createWalletClient({
//     chain: sepolia,
//     transport: http("https://eth-sepolia.g.alchemy.com/v2/U4KPgXJi3FAILfXVYloxhngoXfSLZnER"),
//   });
//   const publicClient = createPublicClient({
//     chain: sepolia,
//     transport: http("https://eth-sepolia.g.alchemy.com/v2/U4KPgXJi3FAILfXVYloxhngoXfSLZnER"),
//   });

//   const chainHabitsContract = getContract({
//     address: address,
//     abi,
//     client: walletClient,
//   });

//   const userAddressList = await publicClient.readContract({
//     address: address,
//     abi,
//     functionName: "getAllUserDetails",
//     args: [],
//   });

//   if (!userAddressList || userAddressList.length === 0) {
//     return null;
//   }

//   console.log("userAddressList", userAddressList);

//   // const Address_liveChallenges = await publicClient.readContract({
//   //   address: address,
//   //   abi,
//   //   functionName: "getLiveChallenges",
//   //   args: [userAddressList],
//   // });

//   // if (Address_liveChallenges.length === 0) {
//   //   return null;
//   // }

//   // await Promise.all(
//   //   Address_liveChallenges.map(async userAddress => {
//   //     await handleUserChallenge(userAddress, currentEpoch);
//   //   }),
//   // );

//   return { success: true };
// }

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
