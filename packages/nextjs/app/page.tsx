"use client";

import React from "react";
import { useTargetNetwork } from "../hooks/scaffold-eth/useTargetNetwork";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { SubmitButton } from "~~/components/buttons";
import { ProfileSVG } from "~~/components/svg";
import { accountType } from "~~/config/AlchemyConfig";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useStravaState } from "~~/services/store/store";
import { ProfileStatProps } from "~~/types/utils";

const ProfileStat: React.FC<ProfileStatProps> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-indigo-200">{label}:</span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

const ObjectiveCard: React.FC<{ index: number }> = ({ index }) => (
  <div
    className={`rounded-lg p-6 transition-all shadow-lg flex flex-col justify-between
            ${
              index % 2 === 0
                ? "bg-gradient-to-br from-green-400/30 to-green-600/30 hover:from-green-400/40 hover:to-green-600/40"
                : "bg-gradient-to-br from-red-400/30 to-red-600/30 hover:from-red-400/40 hover:to-red-600/40"
            }`}
  >
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Week {index + 1}</h3>
        <span
          className={`text-sm px-2 py-1 rounded-full
                ${index % 2 === 0 ? "bg-green-500/50 text-green-100" : "bg-red-500/50 text-red-100"}`}
        >
          {index % 2 === 0 ? "Success" : "Failed"}
        </span>
      </div>
    </div>
  </div>
);

const Home: NextPage = () => {
  const { targetNetwork } = useTargetNetwork();
  console.log("targetNetwork", targetNetwork);
  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const { bio, city, country, firstname, lastname, premium, sex, state, username } = useStravaState(state =>
    state.getStravaProfile(),
  );
  const { data: userDetails } = useScaffoldReadContract({
    contractName: "ChainHabits",
    functionName: "getUserDetails",
    args: [address ?? alchemyAddress],
  });

  const { challengeTally, SuccessfulChallenges, currenStaked, totalDonated } = userDetails ?? {};

  const handleApiCall = async () => {
    const chainID = targetNetwork.id;

    try {
      const response = await fetch("api/StravaCall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chainID }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API call successful:", data);
      } else {
        console.error("API call failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full bg-cover bg-center relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(88, 28, 135, 0.8))",
      }}
    >
      <div className="w-full max-w-6xl space-y-12 sm:space-y-16">
        <div className="mt-16 z-10 w-full p-6 md:p-8 backdrop-blur-md bg-white bg-opacity-10 rounded-2xl shadow-2xl border border-white border-opacity-20">
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              {ProfileSVG}
            </div>
          </div>

          <div className="text-center pt-20 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{username || "User Profile"}</h1>
            <p className="text-indigo-200">{bio || "No bio available"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Challenge Stats</h2>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 space-y-3">
                <ProfileStat label="Challenge Tally" value={String(challengeTally ?? 0n)} />
                <ProfileStat label="Successful Challenges" value={String(SuccessfulChallenges ?? 0n)} />
                <ProfileStat label="Current Staked" value={`${formatEther(currenStaked ?? 0n)} ETH`} />
                <ProfileStat label="Total Donated" value={`${formatEther(totalDonated ?? 0n)} ETH`} />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Personal Info</h2>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 space-y-3">
                <ProfileStat label="Name" value={`${firstname || ""} ${lastname || ""}`} />
                <ProfileStat label="Location" value={`${city || ""}, ${state || ""}, ${country || ""}`} />
                <ProfileStat label="Gender" value={sex || "Not specified"} />
                <ProfileStat label="Account Type" value={premium ? "Premium" : "Standard"} />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <SubmitButton
              onClick={handleApiCall}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full"
            />
          </div>
        </div>

        <div className="w-full max-w-6xl space-y-12 sm:space-y-16">
          <div className="z-10 w-full p-6 md:p-8 backdrop-blur-md bg-white bg-opacity-10 rounded-2xl shadow-2xl border border-white border-opacity-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((task, index) => (
                <ObjectiveCard key={index} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
