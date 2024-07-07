"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ObjectiveCard } from "~~/components/cards";
import { MoonSpinner } from "~~/components/loader";
import { accountType } from "~~/config/AlchemyConfig";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const ChallengeDetailItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col items-start">
    <span className="text-purple-300 text-sm">{label}</span>
    <span className="text-white font-medium text-lg">{value}</span>
  </div>
);

const Home: NextPage = () => {
  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { data: challengeID } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "getChallengeId",
    args: [address ?? alchemyAddress],
  });

  const { data: challengeDetails } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "getChallengeDetails",
    args: [challengeID],
  });

  useEffect(() => {
    if (!Number.isNaN(challengeID) && challengeDetails) {
      setIsLoading(false);
    }
  }, [challengeID, challengeDetails]);

  if (isLoading) return <MoonSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          {challengeDetails?.isLive ? (
            <div className="p-4 sm:p-6 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center">
                <span className="mb-2 sm:mb-0">Active Challenge</span>
                <span className="text-sm font-semibold px-3 py-1 bg-green-500 text-white rounded-full sm:ml-3 self-start sm:self-auto">
                  Ongoing
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* <ChallengeDetailItem label="Objective" value={challengeDetails.objective} /> */}
                <ChallengeDetailItem label="Target" value={`${challengeDetails?.targetMiles} miles`} />
                <ChallengeDetailItem label="Duration" value={`${challengeDetails?.NoOfWeeks} weeks`} />
                <ChallengeDetailItem label="Failed Weeks" value={challengeDetails.failedWeeks} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {/* // @ts-ignore */}
                {[...Array(challengeDetails.NoOfWeeks)].map((_, index) => (
                  <ObjectiveCard key={index} index={index} />
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
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
