import React, { SetStateAction } from "react";

export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;

export interface MetadataProps {
  title: string;
  description: string;
  imageRelativePath?: string;
}

export type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

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

export type stakeProps = { stakedAmount: bigint; stakedTokens: bigint };
export type failedStakeProps = { stakedAmount: bigint; ERC20Address: string };

export type ProfileChallengeData = {
  challengeTally: number;
  successChallenge: number;
  failedChallengeStake: stakeProps;
  user: null | stakeProps;
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
  ERC20Address: string;
  createdAt: bigint;
  updatedAt: bigint;
  transactionHash: string;
  reviews: IntervalReviews[];
}

export interface IntervalReviews {
  status: boolean;
  createdAt: bigint;
}

type TokenExtension = {
  baseBridgeAddress: string;
  opListId: string;
  opTokenId: string;
};

export interface ERCTokens {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  extensions: TokenExtension;
}

export interface CommonState {
  state: {
    ERCTokens: ERCTokens[];
    ERCTokensInChain: ERCTokens[];
  };
  setERCTokens: (data: ERCTokens[]) => void;
  getERCTokens: () => ERCTokens[];
  setERCTokensInChain: (chainId: number) => void;
  getERCTokensInChain: () => ERCTokens[];
  getERCTokensByAddress: (address: string) => ERCTokens;
}

export interface Option {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  className?: string;
}

export type UserDetails =
  | {
      userID: bigint;
      refreshToken: string;
    }
  | undefined;

export type CreateChallengesProps = {
  objective: string;
  setObjective: (value: string) => void;
  noOfWeeks: number | null;
  setNoOfWeeks: (value: SetStateAction<number | null>) => void;
  startingMiles: number | null;
  setStartingMiles: (value: SetStateAction<number | null>) => void;
  targetIncrease: number | null;
  setTargetIncrease: (value: number) => void;
  forfeitAddress: string;
  setForfeitAddress: (value: string) => void;
  token: boolean;
  setToken: (value: boolean) => void;
  isGBP: boolean;
  setIsGBP: (value: boolean) => void;
  selectedToken: string;
  setSelectedToken: (value: string) => void;
  stakeValue: number | null;
  setStakeValue: (value: SetStateAction<number | null>) => void;
  price: string;
  handleCreateChallenge: () => void;
  clearAll: () => void;
};

export type TokenSelectorProps = {
  token: boolean;
  isGBP: boolean;
  setIsGBP: (value: boolean) => void;
  setToken: (value: boolean) => void;
  selectedToken: string;
  setSelectedToken: (value: string) => void;
  stakeValue: number | null;
  setStakeValue: (value: SetStateAction<number | null>) => void;
  options: Array<{ value: string; label: string }>;
  price: string;
  assignValue: (value: string, setState: (stateValue: SetStateAction<number | null>) => void) => void;
};

export type FormInputProps = {
  label: string;
  onChange: (value: string) => void;
  value: string | number;
  placeholder: string;
  tooltip?: string;
};

export type AddressInputProps = {
  label: string;
  onChange: (value: string) => void;
  value: string;
  placeholder: string;
};
