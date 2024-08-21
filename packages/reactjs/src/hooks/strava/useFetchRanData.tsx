import { useCallback } from "react";
import { useStrava } from "./useStrava";
import AxiosInstance from "~~/config/AxiosConfig";
import { UserDetails } from "~~/types/utils";
import { notification } from "~~/utils/scaffold-eth";

function useFetchRanData(userDetails: UserDetails) {
  const { callStravaApi } = useStrava();
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
  return fetchRanData;
}

export default useFetchRanData;
