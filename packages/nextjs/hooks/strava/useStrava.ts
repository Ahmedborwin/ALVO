import axios from "axios";
import { getUnixTime } from "date-fns";
import { STRAVA_REFRESH_REQUEST_TOKEN_URL, STRAVA_REQUEST_TOKEN_URL } from "~~/constants";
import { useStravaState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export const useStrava = () => {
  const { setUserData, updateTokens, getStravaTokens } = useStravaState(state => state);
  const requestToken = async (authorizationCode: string) => {
    try {
      const { data } = await axios.post(`${STRAVA_REQUEST_TOKEN_URL}&code=${authorizationCode}`);
      setUserData(data);
      return data;
    } catch (error) {
      console.error(error);
      notification.error("Something went wrong request failed");
    }
  };

  // const deAuthorizeStrava = async () => {
  //   try {
  //     await axios.post(STRAVA_DE_AUTHORIZE_URL);
  //     setReinitializeData();
  //     return;
  //   } catch (error) {
  //     console.error(error);
  //     notification.error("Something went wrong request failed");
  //   }
  // };

  const refreshExpiredToken = async (refresh_token: string) => {
    try {
      const { data } = await axios.post(`${STRAVA_REFRESH_REQUEST_TOKEN_URL}&refresh_token=${refresh_token}`);

      updateTokens({
        access_token: data.access_token,
        expires_at: data.expires_at,
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
      });
      return data;
    } catch (error) {
      console.error(error);
      notification.error("Something went wrong can't renew the token");
    }
  };

  const callStravaApi = async (cb: () => Promise<any>) => {
    try {
      const stateData = getStravaTokens();
      if (stateData.expires_at === null || stateData.refresh_token === null || stateData.expires_in === null)
        throw new Error("no autherized strava token found");
      const currentTime = getUnixTime(new Date());
      const expireTime = getUnixTime(stateData.expires_at);
      if (expireTime > currentTime) return await cb();
      await refreshExpiredToken(stateData.refresh_token);
      const renewedStateData = getStravaTokens();
      if ((renewedStateData.expires_in as number) < currentTime)
        throw new Error("not able to found valid strava token");
      return await cb();
    } catch (error) {
      console.error(error);
      notification.error("Something went wrong");
    }
  };

  return {
    requestToken,
    callStravaApi,
  };
};
