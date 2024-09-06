import { ObjectiveCard } from "../cards";
import ChallengeDetailItem from "./ChallengeDetaiItem";
import { Challenge, IntervalReviews } from "~~/types/utils";

function ActiveChallenges({ challengeDetails, ranMiles }: { challengeDetails: Challenge; ranMiles: string | null }) {
  return (
    <div className="p-4 sm:p-6 md:p-10">
      <h2 className="text-2xl sm:text-3xl font-bold  mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center">
        <span className="mb-2 sm:mb-0  font-semibold">Active Challenge</span>
        <span className="text-sm font-semibold px-3 py-1 bg-green-500 text-white rounded-full sm:ml-3 self-start sm:self-auto">
          Ongoing
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ChallengeDetailItem label="Objective" value={challengeDetails.objective} />
        <ChallengeDetailItem label="Target" value={`${challengeDetails?.startingMiles} miles`} />
        <ChallengeDetailItem label="Miles recorded this week" value={ranMiles || 0} loading={ranMiles === null} />
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
  );
}

export default ActiveChallenges;
