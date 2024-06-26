import axios from "axios";
import { getUnixTime } from "date-fns";
import { STRAVA_REFRESH_REQUEST_TOKEN_URL, STRAVA_REQUEST_TOKEN_URL } from "~~/constants";
import { useStravaState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export const useStrava = () => {
  const { setUserData, updateTokens, getStravaTokens, clearUserData } = useStravaState(state => state);
  const requestToken = async (authorizationCode: string) => {
    try {
      const { data } = await axios.post(`${STRAVA_REQUEST_TOKEN_URL}&code=${authorizationCode}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const storeStravaToken = async (authorizationCode: string) => {
    try {
      const data = await requestToken(authorizationCode);
      setUserData(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  };
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

  const clearStravaData = () => {
    clearUserData();
  };

  const callStravaApi = async (cb: () => Promise<any>, fromStrava?: string) => {
    try {
      const stateData = getStravaTokens();
      if (typeof fromStrava !== "string")
        if (stateData.expires_at === null || stateData.refresh_token === null || stateData.expires_in === null)
          throw new Error("no authorized strava token found");
      const currentTime = getUnixTime(new Date());
      const expireTime = getUnixTime(stateData.expires_at || 0);
      if (expireTime > currentTime) return await cb();
      await refreshExpiredToken(stateData.refresh_token || String(fromStrava));
      return await cb();
    } catch (error) {
      console.error(error);
      notification.error("Something went wrong");
    }
  };

  return {
    requestToken,
    clearStravaData,
    callStravaApi,
    setUserData,
    getStravaTokens,
    storeStravaToken,
  };
};
