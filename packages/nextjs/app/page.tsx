"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import { gql, useQuery } from "@apollo/client";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ObjectiveCard } from "~~/components/cards";
import { MoonSpinner } from "~~/components/loader";
import { accountType } from "~~/config/AlchemyConfig";
import AxiosInstance from "~~/config/AxiosConfig";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useStrava } from "~~/hooks/strava";
import { CREATE_CHALLENGES } from "~~/services/graphql/queries";
import { Challenge, IntervalReviews } from "~~/types/utils";
import { notification } from "~~/utils/scaffold-eth";

const ChallengeDetailItem = ({
  label,
  value,
  loading = false,
}: {
  label: string;
  value: string | number;
  loading?: boolean;
}) => (
  <div className="flex flex-col items-start">
    <span className="text-purple-300 text-sm">{label}</span>
    {loading ? (
      <span className="loading loading-dots loading-sm"></span>
    ) : (
      <span className="text-white font-medium text-lg">{value}</span>
    )}
  </div>
);

const Home: NextPage = () => {
  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ranMiles, setRanMiles] = useState<string | null>(null);

  const GET_CHALLENGE_GQL = gql(CREATE_CHALLENGES);

  const { callStravaApi } = useStrava();

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
            <div className="p-4 sm:p-6 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center">
                <span className="mb-2 sm:mb-0">Active Challenge</span>
                <span className="text-sm font-semibold px-3 py-1 bg-green-500 text-white rounded-full sm:ml-3 self-start sm:self-auto">
                  Ongoing
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <ChallengeDetailItem label="Objective" value={challengeDetails.objective} />
                <ChallengeDetailItem label="Target" value={`${challengeDetails?.startingMiles} miles`} />
                <ChallengeDetailItem
                  label="Miles recorded this week"
                  value={ranMiles || 0}
                  loading={ranMiles === null}
                />
                <ChallengeDetailItem
                  label="Failed Weeks"
                  value={(challengeDetails?.reviews.filter((item: IntervalReviews) => item.status === false)).length}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          ) : (
            <div className="bg-gradient-to-br from-slate-900 to-purple-900">
              <div className="max-w-6xl mx-auto">
                <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
                  <div className="p-4 sm:p-6 md:p-10 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">No Active Challenges</h2>
                    <p className="text-lg sm:text-xl text-indigo-200 mb-4 sm:mb-8">
                      You don&apos;t have any active challenges at the moment. Ready to set a new goal?
                    </p>
                    <p className="text-base sm:text-lg text-indigo-300 mb-6 sm:mb-10">
                      Every accomplishment starts with the decision to try. Set your goal, commit to it, and watch
                      yourself transform.
                    </p>
                    <Link href="/challenge">
                      <span className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                        Create New Challenge
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
