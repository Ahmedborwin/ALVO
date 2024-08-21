import axios from "axios";
import { STRAVA_AXIOS_BASE_URL } from "~~/constants";
import { StravaTokenResponse } from "~~/types/utils";

const AxiosInstance = axios.create({
  baseURL: STRAVA_AXIOS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

AxiosInstance.interceptors.request.use(
  config => {
    const accessToken: StravaTokenResponse = JSON.parse(localStorage.getItem("strava-data") ?? "")?.state?.userData;
    if (accessToken) if (config.headers) config.headers.Authorization = `Bearer ${accessToken.access_token}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
AxiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error);
  },
);
export default AxiosInstance;
