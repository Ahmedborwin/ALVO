// Types
type User = {
  id: string;
  userAddress: string;
  stakedAmount: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  transactionHash: string;
};

type Challenge = {
  id: string;
  challengeId: string;
  user: User;
  userAddress: string;
  objective: string;
  startingMiles: number;
  numberOfWeeks: number;
  stakedAmount: string;
  ERC20Address: string;
  defaultAddress: string;
  isLive: boolean;
  failedWeeks: string;
  createdAt: string;
  updatedAt: string;
  transactionHash: string;
  competitionDeadline: string;
  nextIntervalReviewEpoch: string;
  intervalReviewTally: number;
  intervalReviews: { week: number; success: boolean }[];
};

export { Challenge, User };
