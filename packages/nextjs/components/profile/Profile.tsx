import React, { useMemo, useState } from "react";
import { MoonSpinner } from "../loader";
import { useAccount as useAlchemyAccount } from "@alchemy/aa-alchemy/react";
import { gql, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import { accountType } from "~~/config/AlchemyConfig";
import { useWeiToUSD } from "~~/hooks/common";
import { PROFILE_CHALLENGES } from "~~/services/graphql/queries";
import { useStravaState } from "~~/services/store/store";
import { ProfileChallengeData, ProfileStatProps } from "~~/types/utils";

const ProfileStat: React.FC<ProfileStatProps> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-indigo-200">{label}:</span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

function Profile() {
  const { address } = useAccount();
  const { address: alchemyAddress } = useAlchemyAccount({ type: accountType });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { bio, city, country, firstname, lastname, premium, sex, state, username } = useStravaState(state =>
    state.getStravaProfile(),
  );

  const GET_CHALLENGE_GQL = gql(PROFILE_CHALLENGES);

  const { data, loading } = useQuery(GET_CHALLENGE_GQL, {
    variables: { address: address || alchemyAddress },
    fetchPolicy: "network-only",
  });

  const challengeData = useMemo(() => {
    const obj: ProfileChallengeData = {
      challengeTally: 0,
      successChallenge: 0,
      failedChallenge: 0n,
      user: null,
    };
    if (data && !loading) {
      setIsLoading(false);

      const { challengeTally, successChallenge, failedChallenge, user } = data;
      const failedAmount: bigint = failedChallenge.reduce((prev: bigint, item: { stakedAmount: bigint }): bigint => {
        prev += item.stakedAmount;
        return prev;
      }, 0n);
      obj.challengeTally = challengeTally.length;
      obj.successChallenge = successChallenge.length;
      obj.failedChallenge = failedAmount;
      obj.user = user.length ? user[0] : {};
    }
    return obj;
  }, [data, loading]);

  const stakedAmount = useWeiToUSD(challengeData.user?.stakedAmount);
  const failedChallenge = useWeiToUSD(challengeData.failedChallenge);

  return isLoading ? (
    <MoonSpinner />
  ) : (
    <div>
      <div className="text-center mb-6 sm:mb-8 pt-8 sm:pt-10">
        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-4 border-white">
          <div className="text-white text-3xl sm:text-4xl font-bold">{username?.charAt(0) || "U"}</div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{username || "User Profile"}</h1>
        <p className="text-sm sm:text-base text-indigo-200">{bio || "No bio available"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-4">User Stats</h2>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <ProfileStat label="Challenge Tally" value={challengeData.challengeTally} />
            <ProfileStat label="Successful Challenges" value={challengeData.successChallenge} />
            <ProfileStat label="Current Staked" value={`${stakedAmount} USD`} />
            <ProfileStat label="Total Donated" value={`${failedChallenge} USD`} />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-4">Personal Info</h2>
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <ProfileStat label="Name" value={`${firstname || ""} ${lastname || ""}`} />
            <ProfileStat label="Location" value={`${city || ""}, ${state || ""}, ${country || ""}`} />
            <ProfileStat label="Gender" value={sex || "Not specified"} />
            <ProfileStat label="Account Type" value={premium ? "Premium" : "Standard"} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
