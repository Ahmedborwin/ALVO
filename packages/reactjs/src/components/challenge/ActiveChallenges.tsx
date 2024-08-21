import { useMemo } from "react";
import { DetailCard, ObjectiveCard } from "../cards";
import { useWeiToUSD } from "~~/hooks/common";
import { useCommonState } from "~~/services/store/store";
import { Challenge, IntervalReviews } from "~~/types/utils";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

function ActiveChallenges({ challengeDetails, ranMiles }: { challengeDetails: Challenge; ranMiles: string | null }) {
  const getERCTokensByAddress = useCommonState(state => state.getERCTokensByAddress);
  const StakedType = useMemo(() => {
    if (challengeDetails?.ERC20Address)
      return isZeroAddress(challengeDetails?.ERC20Address)
        ? "USD"
        : getERCTokensByAddress(challengeDetails?.ERC20Address)?.name || "ERC";
  }, [challengeDetails?.ERC20Address]);

  const stakedAmount = useWeiToUSD(challengeDetails?.stakedAmount);
  return (
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
            value={`${challengeDetails?.defaultAddress.slice(0, 6)}...${challengeDetails?.defaultAddress.slice(-4)}`}
          />
          <DetailCard
            title="Staked"
            value={`${StakedType === "USD" ? stakedAmount : challengeDetails?.stakedAmount || 0} ${StakedType}`}
          />
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
  );
}

export default ActiveChallenges;
