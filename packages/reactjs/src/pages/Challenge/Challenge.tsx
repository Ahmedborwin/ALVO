import { useEffect, useMemo, useState } from "react";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import { gql, useQuery } from "@apollo/client";
import { isAddress, parseEther, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { ActiveChallenges, CreateChallenges } from "~~/components/challenge";
import { MoonSpinner } from "~~/components/loader";
import { accountType } from "~~/config/AlchemyConfig";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useFetchRanData } from "~~/hooks/strava";
import { CHALLENGES_CREATED_QUERY } from "~~/services/graphql/queries";
import { useGlobalState } from "~~/services/store/store";
import { Challenge as ChallengeType } from "~~/types/utils";
import { notification } from "~~/utils/scaffold-eth";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

const Challenge = () => {
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

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("ChainHabits");

  const { gbpPrice, price: nativeCurrencyPrice } = useGlobalState(state => state.nativeCurrency);

  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const GET_CHALLENGE_GQL = gql(CHALLENGES_CREATED_QUERY);

  const { data, loading } = useQuery(GET_CHALLENGE_GQL, {
    variables: { address: address || alchemyAddress },
    fetchPolicy: "network-only",
  });

  const { data: userDetails } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "getUserDetails",
    args: [address ?? alchemyAddress],
  });

  const { data: challengeID } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "getChallengeId",
    args: [address ?? alchemyAddress],
  });

  const { data: challengeDetailsContract } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "getChallengeDetails",
    args: [challengeID],
  });

  const { data: AlVOContractDetails } = useDeployedContractInfo("ChainHabits");

  const fetchRanData = useFetchRanData(userDetails);

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
      if (challengeDetailsContract?.isLive) {
        notification.info("Already have a active challenge");
        return;
      }

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
      if (token && !isZeroAddress(selectedToken)) {
        await writeYourContractAsync(
          {
            functionName: "approve",
            args: [AlVOContractDetails?.address, BigInt(stakeValue * 1e6)],
            targetERCAddress: selectedToken,
          },
          undefined,
          selectedToken,
        );
      }
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {!challengeDetails?.status ? (
        <CreateChallenges
          // Action Handlers
          clearAll={clearAll}
          handleCreateChallenge={handleCreateChallenge}
          // State Values
          isGBP={isGBP}
          noOfWeeks={noOfWeeks}
          objective={objective}
          forfeitAddress={forfeitAddress}
          price={String(price)}
          selectedToken={selectedToken}
          stakeValue={stakeValue}
          startingMiles={startingMiles}
          targetIncrease={targetIncrease}
          token={token}
          // Setters
          setForfeitAddress={setForfeitAddress}
          setIsGBP={setIsGBP}
          setNoOfWeeks={setNoOfWeeks}
          setObjective={setObjective}
          setSelectedToken={setSelectedToken}
          setStakeValue={setStakeValue}
          setStartingMiles={setStartingMiles}
          setTargetIncrease={setTargetIncrease}
          setToken={setToken}
        />
      ) : (
        <ActiveChallenges challengeDetails={challengeDetails} ranMiles={ranMiles} />
      )}
    </div>
  );
};

export default Challenge;
