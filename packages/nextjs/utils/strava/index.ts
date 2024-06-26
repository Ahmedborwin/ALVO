import { Athlete, StravaTokenResponse } from "~~/types/utils";

const filterStravaResponse = (initialState: StravaTokenResponse, newState: any): StravaTokenResponse => {
  const newObj: any = {};
  for (const key in initialState) if (Object.prototype.hasOwnProperty.call(newState, key)) newObj[key] = newState[key];
  newObj["athlete"] = filterAthleteDetails(newObj["athlete"]);
  return newObj as StravaTokenResponse;
};

const filterAthleteDetails = (newState: any): Athlete => {
  const newObj: any = {};
  const initialState = {
    id: null,
    username: null,
    firstname: null,
    lastname: null,
    bio: null,
    city: null,
    state: null,
    country: null,
    sex: null,
    premium: null,
    summit: null,
    profile_medium: null,
    profile: null,
  };
  for (const key in initialState) if (Object.prototype.hasOwnProperty.call(newState, key)) newObj[key] = newState[key];
  return newObj as Athlete;
};

const reInitializeStravaData = (initialState: StravaTokenResponse): StravaTokenResponse => {
  const newObj: any = {};
  for (const key in initialState) if (Object.prototype.hasOwnProperty.call(initialState, key)) newObj[key] = null;
  return newObj as StravaTokenResponse;
};

export { filterStravaResponse, reInitializeStravaData };
