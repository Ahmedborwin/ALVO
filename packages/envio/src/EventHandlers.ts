import { ChainHabits, User, Challenge, IntervalReviews } from "generated";

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
const zeroAddress = "0x0000000000000000000000000000000000000000";

// Handler for NewUserRegistered event
ChainHabits.NewUserRegistered.handler(async ({ event, context }) => {
  const userEntity: User = {
    id: event.params.user.toString(),
    userAddress: event.params.user,
    stakedAmount: BigInt(0),
    stakedTokens: BigInt(0),
    createdAt: BigInt(event.block.timestamp),
    updatedAt: BigInt(event.block.timestamp),
    status: true,
    transactionHash: event.transaction.toString(),
  };
  context.User.set(userEntity);
});

// Handler for NewChallengeCreated event
ChainHabits.NewChallengeCreated.handler(async ({ event, context }) => {
  const userId = event.params.user.toString();
  const currentUser = await context.User.get(userId);

  if (currentUser) {
    if (event.params.erc20Address === zeroAddress) {
      const userEntity: User = {
        ...currentUser,
        stakedAmount: currentUser.stakedAmount + event.params.amount,
        updatedAt: BigInt(event.block.timestamp),
      };
      context.User.set(userEntity);
    } else {
      const userEntity: User = {
        ...currentUser,
        stakedTokens: currentUser.stakedTokens + event.params.amount,
        updatedAt: BigInt(event.block.timestamp),
      };
      context.User.set(userEntity);
    }
  }
  const deadlineDateEpoch =
    BigInt(event.params.NumberofWeeks) * BigInt(ONE_WEEK_IN_SECONDS);
  const challengeId = event.params.challengeId.toString();

  const challengeEntity: Challenge = {
    id: challengeId,
    challengeId: event.params.challengeId,
    userAddress: event.params.user,
    objective: event.params.Objective,
    startingMiles: Number(event.params.startingMiles),
    numberOfWeeks: Number(event.params.NumberofWeeks),
    defaultAddress: event.params.defaultAddress,
    failedWeeks: BigInt(0),
    success: 2,
    stakedAmount: event.params.amount,
    createdAt: BigInt(event.block.timestamp),
    updatedAt: BigInt(event.block.timestamp),
    status: true,
    transactionHash: event.transaction.toString(),
    weeklyTargetIncreasePercentage: Number(event.params.PercentageIncrease),
    eRC20Address: event.params.erc20Address,
    competitionDeadline: BigInt(event.block.timestamp) + deadlineDateEpoch,
    nextIntervalReviewEpoch:
      BigInt(event.block.timestamp) + BigInt(ONE_WEEK_IN_SECONDS),
    intervalReviewTally: 0,
    user_id: userId,
  };
  context.Challenge.set(challengeEntity);
});

// Handler for FundsWithdrawn event
ChainHabits.FundsWithdrawn.handler(async ({ event, context }) => {
  const userId = event.params.user.toString();
  const currentUser = await context.User.get(userId);

  if (currentUser) {
    if (event.params.erc20Address === zeroAddress) {
      const userEntity: User = {
        ...currentUser,
        stakedAmount: currentUser.stakedAmount - event.params.amount,
        updatedAt: BigInt(event.block.timestamp),
      };
      context.User.set(userEntity);
    } else {
      const userEntity: User = {
        ...currentUser,
        stakedTokens: currentUser.stakedTokens - event.params.amount,
        updatedAt: BigInt(event.block.timestamp),
      };
      context.User.set(userEntity);
    }
  }
});

// Handler for IntervalReviewCompleted event
ChainHabits.IntervalReviewCompleted.handler(async ({ event, context }) => {
  const reviewId = `${event.transaction}-${event.block.timestamp}-${event.logIndex}-${event.block.hash}`;
  const reviewEntity: IntervalReviews = {
    id: reviewId,
    challengeId: event.params.challengeId,
    createdAt: BigInt(event.block.timestamp),
    updatedAt: BigInt(event.block.timestamp),
    status: event.params.success,
    transactionHash: event.transaction.toString(),
    challenge_id: event.params.challengeId.toString(),
  };
  context.IntervalReviews.set(reviewEntity);

  const challengeId = event.params.challengeId.toString();
  const currentChallenge = await context.Challenge.get(challengeId);

  if (currentChallenge) {
    const challengeEntity: Challenge = {
      ...currentChallenge,
      failedWeeks: currentChallenge.failedWeeks + BigInt(1),
      nextIntervalReviewEpoch:
        currentChallenge.nextIntervalReviewEpoch + BigInt(ONE_WEEK_IN_SECONDS),
      intervalReviewTally: currentChallenge.intervalReviewTally + 1,
      startingMiles:
        currentChallenge.weeklyTargetIncreasePercentage > 0
          ? currentChallenge.startingMiles +
            Math.floor(
              (currentChallenge.startingMiles *
                currentChallenge.weeklyTargetIncreasePercentage) /
                100
            )
          : currentChallenge.startingMiles,
      updatedAt: BigInt(event.block.timestamp),
    };

    context.Challenge.set(challengeEntity);
  }
});

// Handler for ChallengeCompleted event
ChainHabits.ChallengeCompleted.handler(async ({ event, context }) => {
  const challengeId = event.params.challengeId.toString();
  const currentChallenge = await context.Challenge.get(challengeId);

  if (currentChallenge) {
    const challengeEntity: Challenge = {
      ...currentChallenge,
      stakedAmount: currentChallenge.stakedAmount - event.params.stakeForfeited,
      success: event.params.status ? 1 : 0,
      status: false,
      updatedAt: BigInt(event.block.timestamp),
    };

    context.Challenge.set(challengeEntity);
  }

  const userId = event.params.user.toString();
  const currentUser = await context.User.get(userId);

  if (currentUser) {
    if (event.params.erc20Address === zeroAddress) {
      const userEntity: User = {
        ...currentUser,
        stakedAmount: currentUser.stakedAmount - event.params.stakeForfeited,
        updatedAt: BigInt(event.block.timestamp),
      };
      context.User.set(userEntity);
    } else {
      const userEntity: User = {
        ...currentUser,
        stakedTokens: currentUser.stakedTokens - event.params.stakeForfeited,
        updatedAt: BigInt(event.block.timestamp),
      };
      context.User.set(userEntity);
    }
  }
});
