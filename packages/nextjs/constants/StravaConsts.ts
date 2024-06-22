import {
  NEXT_PUBLIC_STRAVA_CLIENT_ID,
  NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
  NEXT_PUBLIC_STRAVA_REDIRECT_URI,
  NEXT_PUBLIC_STRAVA_SCOPE,
} from "./EnvConsts";

const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${NEXT_PUBLIC_STRAVA_CLIENT_ID}&redirect_uri=${NEXT_PUBLIC_STRAVA_REDIRECT_URI}&response_type=code&scope=${NEXT_PUBLIC_STRAVA_SCOPE}`;
const STRAVA_REQUEST_TOKEN_URL = `https://www.strava.com/api/v3/oauth/token?client_id=${NEXT_PUBLIC_STRAVA_CLIENT_ID}&client_secret=${NEXT_PUBLIC_STRAVA_CLIENT_SECRET}&grant_type=authorization_code`;
const STRAVA_REFRESH_REQUEST_TOKEN_URL = `https://www.strava.com/api/v3/oauth/token?client_id=${NEXT_PUBLIC_STRAVA_CLIENT_ID}&client_secret=${NEXT_PUBLIC_STRAVA_CLIENT_SECRET}&grant_type=refresh_token`;
const STRAVA_DE_AUTHORIZE_URL = `https://www.strava.com/oauth/deauthorize`;

export { STRAVA_AUTH_URL, STRAVA_REQUEST_TOKEN_URL, STRAVA_REFRESH_REQUEST_TOKEN_URL, STRAVA_DE_AUTHORIZE_URL };
