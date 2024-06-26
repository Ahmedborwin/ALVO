"use client";

import React from "react";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
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

const Profile: NextPage = () => {
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

  const { challengeTally, SuccessfulChallenges, TotalStaked, TotalDonated } = userDetails ?? {};

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full bg-cover bg-center relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(88, 28, 135, 0.8))",
      }}
    >
      <div className="mt-16 relative z-10 w-full max-w-4xl p-6 md:p-8 backdrop-blur-md bg-white bg-opacity-10 rounded-2xl shadow-2xl border border-white border-opacity-20">
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
              <ProfileStat label="Total Staked" value={`${formatEther(TotalStaked ?? 0n)} ETH`} />
              <ProfileStat label="Total Donated" value={`${formatEther(TotalDonated ?? 0n)} ETH`} />
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
      </div>
    </div>
  );
};

export default Profile;
