export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;

export type Athlete = {
  id: number | null;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  sex: string | null;
  premium: boolean | null;
  summit: boolean | null;
  profile_medium: string | null;
  profile: string | null;
};

export type StravaTokenResponse = {
  expires_at: number | null;
  expires_in: number | null;
  refresh_token: string | null;
  access_token: string | null;
  athlete: Athlete | null;
};

export type StravaRefreshTokenResponse = {
  expires_at: number | null;
  expires_in: number | null;
  refresh_token: string | null;
  access_token: string | null;
};

export interface StravaState {
  userData: StravaTokenResponse;
  setUserData: (data: StravaTokenResponse) => void;
  updateTokens: (data: StravaRefreshTokenResponse) => void;
  clearUserData: () => void;
  getStravaProfile: () => Athlete;
  getStravaTokens: () => StravaRefreshTokenResponse;
}

export type ProfileStatProps = {
  label: string;
  value: string | number;
};

export type ProfileChallengeData = {
  challengeTally: number;
  successChallenge: number;
  failedChallenge: bigint;
  user: null | { stakedAmount: bigint };
};

export interface Challenge {
  challengeId: bigint;
  objective: string;
  startingMiles: number;
  numberOfWeeks: number;
  stakedAmount: bigint;
  nextIntervalReviewEpoch: string;
  defaultAddress: string;
  success: number;
  status: boolean;
  createdAt: bigint;
  updatedAt: bigint;
  transactionHash: string;
  reviews: IntervalReviews[];
}

export interface IntervalReviews {
  status: boolean;
  createdAt: bigint;
}
