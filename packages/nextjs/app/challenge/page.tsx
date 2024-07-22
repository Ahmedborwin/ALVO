"use client";

import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import { gql, useQuery } from "@apollo/client";
import { NextPage } from "next";
import { isAddress, parseEther, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { AddressInput, CustomInput, CustomSelect, ToggleCheckBox } from "~~/components/Input";
import { CancelButton, SubmitButton } from "~~/components/buttons";
import { DetailCard, ObjectiveCard } from "~~/components/cards";
import { MoonSpinner } from "~~/components/loader";
import { accountType } from "~~/config/AlchemyConfig";
import AxiosInstance from "~~/config/AxiosConfig";
import { useWeiToUSD } from "~~/hooks/common";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { useStrava } from "~~/hooks/strava";
import { CREATE_CHALLENGES } from "~~/services/graphql/queries";
import { useCommonState, useGlobalState } from "~~/services/store/store";
import { Challenge as ChallengeType, IntervalReviews, Option } from "~~/types/utils";
import { notification } from "~~/utils/scaffold-eth";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

const Label = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <label htmlFor={label} className="flex items-center text-sm font-medium text-indigo-200 mb-2">
    {label}
    {children}
  </label>
);

const Challenge: NextPage = () => {
  const [objective, setObjective] = useState<string>("");
  const [forfeitAddress, setForfeitAddress] = useState<string>("");
  const [noOfWeeks, setNoOfWeeks] = useState<number | null>(4);
  const [stakeValue, setStakeValue] = useState<number | null>(40);
  const [startingMiles, setStartingMiles] = useState<number | null>(null);
  const [targetIncrease, setTargetIncrease] = useState<number | null>(0);
  const [ranMiles, setRanMiles] = useState<string | null>(null);
  const [isGBP, setIsGBP] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(0);
  const [token, setToken] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<string>(zeroAddress);

  const { callStravaApi } = useStrava();

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("ChainHabits");

  const { gbpPrice, price: nativeCurrencyPrice } = useGlobalState(state => state.nativeCurrency);
  const chainTokenDetails = useCommonState(state => state.getERCTokensInChain());

  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const GET_CHALLENGE_GQL = gql(CREATE_CHALLENGES);

  const { data, loading, refetch } = useQuery(GET_CHALLENGE_GQL, {
    variables: { address: address || alchemyAddress },
    fetchPolicy: "network-only",
  });

  const { data: userDetails } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "getUserDetails",
    args: [address ?? alchemyAddress],
  });

  const allowedTokens: { [key: string]: string } = {
    USDC: "USDC",
  };

  const { data: AlVOContractDetails } = useDeployedContractInfo("ChainHabits");

  const options: Option[] = useMemo(() => {
    return chainTokenDetails.reduce((prev: Option[], { name, address }) => {
      if (allowedTokens[name] === name)
        prev.push({
          value: address,
          label: name,
        });
      return prev;
    }, []);
  }, []);

  const fetchRanData = useCallback(
    async (nextIntervalReviewEpoch: string) => {
      const beforeEpoch = nextIntervalReviewEpoch;
      const afterEpoch = Number(nextIntervalReviewEpoch) - 6048000;
      try {
        const { data } = await callStravaApi(async () => {
          return await AxiosInstance.get(
            `/athlete/activities?before=${beforeEpoch}&after=${afterEpoch}&page=1&per_page=30`,
          );
        }, userDetails?.refreshToken);

        const allActivity: any[] = data;
        const OnlyRuns = allActivity.filter((activity: any) => activity.type === "Run");
        const distanceLogged = OnlyRuns.reduce(
          (accDistance: number, activity: any) => accDistance + activity.distance,
          0,
        );

        return String(Number(distanceLogged / 1609.34)).substring(0, 4) || "0.00";
      } catch (e) {
        console.error(`Error retrieving Strava data: ${e}`);
        notification.error("Something went wrong while fetching latest week running report");
        return "0.00";
      }
    },
    [userDetails],
  );

  const challengeDetails: ChallengeType = useMemo(() => {
    if (data && !loading) {
      setIsLoading(false);
      return data.challenge.length ? data.challenge[0] : {};
    }
    return {};
  }, [data, loading]);

  useEffect(() => {
    if (!token) setSelectedToken(zeroAddress);
  }, [token]);

  useEffect(() => {
    if (data && !loading && userDetails && challengeDetails) {
      const handleMount = async () => {
        const objectiveDetails = data.challenge.length ? data.challenge[0] : {};
        if (objectiveDetails?.status) {
          const value = await fetchRanData(objectiveDetails?.nextIntervalReviewEpoch);
          setRanMiles(value);
        }
        setIsLoading(false);
      };
      handleMount();
    }
    setRanMiles(null);
  }, [data, loading, userDetails, fetchRanData, challengeDetails, setRanMiles]);

  const stakedAmount = useWeiToUSD(challengeDetails?.stakedAmount);
  const getERCTokensByAddress = useCommonState(state => state.getERCTokensByAddress);
  const StakedType = useMemo(() => {
    if (challengeDetails?.ERC20Address)
      return isZeroAddress(challengeDetails?.ERC20Address)
        ? "USD"
        : getERCTokensByAddress(challengeDetails?.ERC20Address)?.name || "ERC";
  }, [challengeDetails?.ERC20Address]);

  useScaffoldWatchContractEvent({
    contractName: "ChainHabits",
    eventName: "NewChallengeCreated",
    onLogs: logs => {
      logs.map(log => {
        const { user } = log.args;
        const fetchAgain = async () => {
          await refetch();
        };
        if (user === address || user === alchemyAddress) fetchAgain();
      });
    },
  });

  const clearAll = () => {
    setObjective("");
    setForfeitAddress("");
    setNoOfWeeks(4);
    setStakeValue(40);
    setTargetIncrease(0);
    setIsGBP(false);
    setStartingMiles(null);
    setSelectedToken(zeroAddress);
  };

  const handleCreateChallenge = async () => {
    try {
      if (
        objective.length === 0 ||
        noOfWeeks === null ||
        stakeValue === null ||
        startingMiles === null ||
        !isAddress(forfeitAddress) ||
        targetIncrease === null
      ) {
        notification.info("Please fill all fields");
        return;
      }
      setIsLoading(true);
      let ethAmount = 0;
      if (!token && isZeroAddress(selectedToken) && AlVOContractDetails?.address) {
        ethAmount = !isGBP
          ? stakeValue / nativeCurrencyPrice
          : (stakeValue * (nativeCurrencyPrice / gbpPrice)) / nativeCurrencyPrice;
      }
      if (token && !isZeroAddress(selectedToken))
        await writeYourContractAsync({
          functionName: "approve",
          args: [AlVOContractDetails?.address, parseEther(stakeValue.toString())],
          targetERCAddress: selectedToken,
        });

      await writeYourContractAsync({
        functionName: "createNewChallenge",
        args: [objective, startingMiles, noOfWeeks, forfeitAddress, targetIncrease, selectedToken, BigInt(stakeValue)],
        value: parseEther(ethAmount.toString()),
      });
      notification.success("Successfully created");
      clearAll();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      notification.error("Failed to create challenge");
      setIsLoading(false);
    }
  };

  const assignValue = useCallback((value: string, setState: (stateValue: SetStateAction<number | null>) => void) => {
    const data = Number(value);
    if (!value) {
      setState(null);
      return;
    }
    if (!Number.isNaN(data) && data >= 1) setState(parseInt(data.toString()));
  }, []);

  const assignPercentage = useCallback((value: string): void => {
    const castValue = Number(value);
    if (!castValue || Number.isNaN(castValue)) {
      setTargetIncrease(0);
      return;
    }
    if (castValue < 0 || castValue > 100) return;
    setTargetIncrease(castValue);
  }, []);

  useEffect(() => {
    if (stakeValue && nativeCurrencyPrice && gbpPrice && !token) {
      let value: number;
      if (isGBP) value = stakeValue * (nativeCurrencyPrice / gbpPrice);
      else value = stakeValue * (gbpPrice / nativeCurrencyPrice);
      setPrice(parseFloat(value.toFixed(2).toString()));
    } else setPrice(0);
  }, [stakeValue, isGBP, nativeCurrencyPrice, gbpPrice, token]);

  if (isLoading) return <MoonSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      {!challengeDetails?.status ? (
        <div className="max-w-md mx-auto">
          <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-3xl shadow-2xl border border-white border-opacity-20 p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Create Challenge</h2>
            <div className="space-y-6">
              <div>
                <Label label="Objective" />
                <CustomInput
                  className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
                  onChange={value => {
                    if (value.length < 100) setObjective(value);
                  }}
                  value={objective}
                  placeholder="What is Your Objective? e.g. Run Marathon"
                  type="text"
                />
              </div>
              <div>
                <Label label="No of weeks" />
                <CustomInput
                  className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
                  onChange={value => assignValue(value, setNoOfWeeks)}
                  value={noOfWeeks ?? ""}
                  placeholder="What is Your Training Period?"
                  type="string"
                />
              </div>
              <div>
                <Label label="Target distance (Miles)" />
                <CustomInput
                  className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
                  onChange={value => assignValue(value, setStartingMiles)}
                  value={startingMiles ?? ""}
                  placeholder="Target weekly distance in miles (e.g. 10 miles)"
                  type="string"
                />
              </div>
              <div>
                <Label label="Target Increase %">
                  <span
                    className="ml-2 text-gray-400 cursor-pointer"
                    title="If set to more than 0, the weekly target will increase by this percentage every week"
                  >
                    ℹ️
                  </span>
                </Label>
                <CustomInput
                  className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
                  onChange={value => assignPercentage(value)}
                  value={targetIncrease ?? ""}
                  placeholder="Weekly target increase percentage (e.g. 5)"
                  type="string"
                />
              </div>
              <div>
                <Label label="Forfeit Address" />
                <AddressInput
                  disabled={false}
                  onChange={value => setForfeitAddress(value)}
                  value={forfeitAddress}
                  placeholder="Address funds will go to (e.g., charity)"
                />
              </div>
              <div className="space-y-6">
                <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-xl shadow-lg border border-white border-opacity-20 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
                    <Label label={`Stake Value (${token ? "ERC" : isGBP ? "GBP" : "USD"})`} />
                    <div className="flex space-x-4">
                      {!token ? (
                        <ToggleCheckBox id="currency-toggle" label="GBP" checked={isGBP} onChange={setIsGBP} />
                      ) : (
                        ""
                      )}
                      <ToggleCheckBox id="token-toggle" label="Token" checked={token} onChange={setToken} />
                    </div>
                  </div>
                  {token ? (
                    <CustomSelect
                      className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200 transition duration-300 ease-in-out"
                      onChange={value => setSelectedToken(value)}
                      value={selectedToken}
                      placeholder={"Select the token"}
                      options={options}
                    />
                  ) : (
                    ""
                  )}
                  <CustomInput
                    className="w-full mt-2 px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200 transition duration-300 ease-in-out"
                    onChange={value => assignValue(value, setStakeValue)}
                    value={stakeValue ?? ""}
                    placeholder={`Enter stake value (${token ? "ERC" : isGBP ? "GBP" : "USD"})`}
                    type="text"
                  />
                  {!token ? (
                    <p className="mt-4 text-sm text-indigo-200">
                      Equivalent: ({isGBP ? "USD" : "GBP"}) {price}
                    </p>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <SubmitButton
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
                  onClick={handleCreateChallenge}
                />
                <CancelButton onClick={clearAll} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-3xl shadow-2xl border border-white border-opacity-20 p-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-between">
              Objective Details
              <span
                className={`text-lg font-semibold px-4 py-1 rounded-full ${
                  challengeDetails?.status ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {challengeDetails?.status ? "Active" : "Inactive"}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <DetailCard title="Objective" value={challengeDetails?.objective} />
              <DetailCard title="Target Miles" value={`${challengeDetails?.startingMiles} miles`} />
              <DetailCard title="Miles recorded this week" value={`${ranMiles} `} loading={ranMiles === null} />
              <DetailCard
                title="Failed Weeks"
                value={`${
                  (challengeDetails?.reviews.filter((item: IntervalReviews) => item.status === false)).length
                } weeks`}
              />
              <DetailCard
                title="Forfeit Address"
                value={`${challengeDetails?.defaultAddress.slice(0, 6)}...${challengeDetails?.defaultAddress.slice(
                  -4,
                )}`}
              />
              <DetailCard title="Staked" value={`${stakedAmount} ${StakedType}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {challengeDetails?.reviews.length
                ? challengeDetails?.reviews.map((item, index) => (
                    <ObjectiveCard key={index} status={item.status} index={index} />
                  ))
                : ""}
              {/* // @ts-ignore */}
              {[...Array(challengeDetails?.numberOfWeeks - challengeDetails?.reviews.length)].map((_, index) => (
                <ObjectiveCard key={index} index={challengeDetails?.reviews.length + index} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenge;
