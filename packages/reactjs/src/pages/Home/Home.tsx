import { useEffect, useMemo, useState } from "react";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import { gql, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import { ActiveChallenges, NoActiveChallenges } from "~~/components/home";
import { MoonSpinner } from "~~/components/loader";
import { accountType } from "~~/config/AlchemyConfig";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useFetchRanData } from "~~/hooks/strava";
import { CHALLENGES_CREATED_QUERY } from "~~/services/graphql/queries";
import { Challenge } from "~~/types/utils";

const Home = () => {
  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ranMiles, setRanMiles] = useState<string | null>(null);

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

  const challengeDetails: Challenge = useMemo(() => {
    if (data && !loading) {
      setIsLoading(false);
      return data.challenge.length ? data.challenge[0] : {};
    }
    return {};
  }, [data, loading]);

  const fetchRanData = useFetchRanData(userDetails);

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

  if (isLoading) return <MoonSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          {challengeDetails?.status ? (
            <ActiveChallenges challengeDetails={challengeDetails} ranMiles={ranMiles} />
          ) : (
            <NoActiveChallenges />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
