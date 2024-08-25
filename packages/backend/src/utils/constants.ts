import "dotenv/config";
const PORT = process.env.PORT || 7000;
const NODE_ENV = process.env.NODE_ENV || "Development";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const apiUrl = "https://api.g.alchemy.com";
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export default {
  PORT,
  NODE_ENV,
  ALCHEMY_API_KEY,
  apiUrl,
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
};
