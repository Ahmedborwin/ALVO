import {
  VITE_STRAVA_CLIENT_ID,
  VITE_STRAVA_CLIENT_SECRET,
  VITE_STRAVA_REDIRECT_URI,
  VITE_STRAVA_SCOPE,
} from "./EnvConsts";

const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${VITE_STRAVA_CLIENT_ID}&redirect_uri=${VITE_STRAVA_REDIRECT_URI}&response_type=code&scope=${VITE_STRAVA_SCOPE}&approval_prompt=force`;
const STRAVA_REQUEST_TOKEN_URL = `https://www.strava.com/api/v3/oauth/token?client_id=${VITE_STRAVA_CLIENT_ID}&client_secret=${VITE_STRAVA_CLIENT_SECRET}&grant_type=authorization_code`;
const STRAVA_REFRESH_REQUEST_TOKEN_URL = `https://www.strava.com/api/v3/oauth/token?client_id=${VITE_STRAVA_CLIENT_ID}&client_secret=${VITE_STRAVA_CLIENT_SECRET}&grant_type=refresh_token`;
const STRAVA_AXIOS_BASE_URL = "https://www.strava.com/api/v3";
export { STRAVA_AUTH_URL, STRAVA_REQUEST_TOKEN_URL, STRAVA_REFRESH_REQUEST_TOKEN_URL, STRAVA_AXIOS_BASE_URL };
