"use client";

import { SetStateAction, useCallback, useMemo, useState } from "react";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import { gql, useQuery } from "@apollo/client";
import { NextPage } from "next";
import { Address, isAddress, parseEther } from "viem";
import { useAccount } from "wagmi";
import { AddressInput, CustomInput } from "~~/components/Input";
import { CancelButton, SubmitButton } from "~~/components/buttons";
import { DetailCard, ObjectiveCard } from "~~/components/cards";
import { MoonSpinner } from "~~/components/loader";
import { accountType } from "~~/config/AlchemyConfig";
import { useWeiToUSD } from "~~/hooks/common";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { CREATE_CHALLENGES } from "~~/services/graphql/queries";
import { useGlobalState } from "~~/services/store/store";
import { Challenge as ChallengeType, IntervalReviews } from "~~/types/utils";
import { notification } from "~~/utils/scaffold-eth";

const Label = ({ label }: { label: string }) => (
  <label htmlFor={label} className="block text-sm font-medium text-indigo-200 mb-2">
    {label}
  </label>
);

const Challenge: NextPage = () => {
  const [objective, setObjective] = useState<string>("");
  const [forfeitAddress, setForfeitAddress] = useState<string>("");
  const [noOfWeeks, setNoOfWeeks] = useState<number | null>(4);
  const [stakeValue, setStakeValue] = useState<number | null>(40);
  const [startingMiles, setStartingMiles] = useState<number | null>(null);

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("ChainHabits");
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const GET_CHALLENGE_GQL = gql(CREATE_CHALLENGES);

  const { data, loading } = useQuery(GET_CHALLENGE_GQL, {
    variables: { address: address || alchemyAddress },
    fetchPolicy: "network-only",
  });

  const challengeDetails: ChallengeType = useMemo(() => {
    if (data && !loading) {
      setIsLoading(false);
      return data.challenge.length ? data.challenge[0] : {};
    }
    return {};
  }, [data, loading]);

  const stakedAmount = useWeiToUSD(challengeDetails?.stakedAmount);

  const clearAll = () => {
    setObjective("");
    setForfeitAddress("");
    setNoOfWeeks(4);
    setStakeValue(40);
    setStartingMiles(null);
  };

  const handleCreateChallenge = async () => {
    try {
      if (
        objective.length === 0 ||
        noOfWeeks === null ||
        stakeValue === null ||
        startingMiles === null ||
        !isAddress(forfeitAddress)
      ) {
        notification.info("Please fill all fields");
        return;
      }

      const ethAmount = stakeValue / nativeCurrencyPrice;
      await writeYourContractAsync({
        functionName: "createNewChallenge",
        args: [objective, startingMiles, noOfWeeks, forfeitAddress as Address],
        value: parseEther(ethAmount.toString()),
      });
      notification.success("Successfully created");
      clearAll();
    } catch (error) {
      console.error(error);
      notification.error("Failed to create challenge");
    }
  };

  const assignValue = useCallback((value: string, setState: (stateValue: SetStateAction<number | null>) => void) => {
    const data = Number(value);
    if (!value) {
      setState(null);
      return;
    }
    if (!Number.isNaN(data) && data >= 1) setState(data);
  }, []);

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
                  type="number"
                />
              </div>
              <div>
                <Label label="Target distance (Miles)" />
                <CustomInput
                  className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
                  onChange={value => assignValue(value, setStartingMiles)}
                  value={startingMiles ?? ""}
                  placeholder="Target weekly distance in miles (e.g. 10 miles)"
                  type="number"
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
              <div>
                <Label label="Stake value (USD)" />
                <CustomInput
                  className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
                  onChange={value => assignValue(value, setStakeValue)}
                  value={stakeValue ?? ""}
                  placeholder="Enter stake value (USD)"
                  type="number"
                />
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
              Challenge Details
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
              <DetailCard title="Duration" value={`${challengeDetails?.numberOfWeeks} weeks`} />
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
              <DetailCard title="Staked" value={`${stakedAmount} USD`} />
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
