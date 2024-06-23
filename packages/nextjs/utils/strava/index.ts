import { Athlete, StravaTokenResponse } from "~~/types/utils";

const filterStravaResponse = (initialState: StravaTokenResponse, newState: any): StravaTokenResponse => {
  const newObj: any = {};
  for (const key in initialState) if (Object.prototype.hasOwnProperty.call(newState, key)) newObj[key] = newState[key];
  newObj["athlete"] = filterAthleteDetails(initialState.athlete as Athlete, newObj["athlete"]);
  return newObj as StravaTokenResponse;
};

const filterAthleteDetails = (initialState: Athlete, newState: any): Athlete => {
  const newObj: any = {};
  for (const key in initialState) if (Object.prototype.hasOwnProperty.call(newState, key)) newObj[key] = newState[key];
  return newObj as Athlete;
};

const reInitializeStravaData = (initialState: StravaTokenResponse): StravaTokenResponse => {
  const newObj: any = {};
  for (const key in initialState) if (Object.prototype.hasOwnProperty.call(initialState, key)) newObj[key] = null;
  return newObj as StravaTokenResponse;
};

export { filterStravaResponse, reInitializeStravaData };
