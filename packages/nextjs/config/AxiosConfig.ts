import axios from "axios";
import { STRAVA_AXIOS_BASE_URL } from "~~/constants";
import { useStravaState } from "~~/services/store/store";

const AxiosInstance = axios.create({
  baseURL: STRAVA_AXIOS_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

AxiosInstance.interceptors.request.use(
  config => {
    const accessToken = useStravaState(state => state.getStravaTokens()).access_token;
    if (accessToken) {
      if (config.headers) config.headers.Authorization = `Bearer ${accessToken}`;
    }
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
