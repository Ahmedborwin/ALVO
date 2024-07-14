import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  NewUserRegistered,
  NewChallengeCreated,
  FundsWithdrawn,
  ChallengeCompleted,
  IntervalReviewCompleted,
} from "../generated/ChainHabits/ChainHabits";
import { User, Challenge, IntervalReviews } from "../generated/schema";

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export function handleUserRegistration(event: NewUserRegistered): void {
  const userCreate = new User(event.params.user.toHexString());
  userCreate.userAddress = event.params.user;
  userCreate.stakedAmount = BigInt.zero();
  userCreate.createdAt = event.block.timestamp;
  userCreate.updatedAt = event.block.timestamp;
  userCreate.status = true;
  userCreate.transactionHash = event.transaction.hash.toHex();
  userCreate.save();
}

export function handleChallengeCreate(event: NewChallengeCreated): void {
  const user = User.load(event.params.user.toHexString());
  if (!user) {
    log.error("User not found: {}", [event.params.user.toHexString()]);
    return;
  }
  user.stakedAmount = user.stakedAmount.plus(event.params.amount);
  user.updatedAt = event.block.timestamp;
  user.save();

  const challenge = new Challenge(event.params.challengeId.toHexString());
  challenge.challengeId = event.params.challengeId;
  challenge.userAddress = event.params.user;
  challenge.user = event.params.user.toHexString();
  challenge.objective = event.params.Objective;
  challenge.startingMiles = event.params.startingMiles;
  challenge.numberOfWeeks = event.params.NumberofWeeks;
  challenge.defaultAddress = event.params.defaultAddress;
  challenge.failedWeeks = BigInt.fromI32(0);
  challenge.success = 2; //What is this variable?
  challenge.stakedAmount = event.params.amount;
  challenge.createdAt = event.block.timestamp;
  challenge.updatedAt = event.block.timestamp;
  challenge.status = true;
  challenge.transactionHash = event.transaction.hash.toHex();
  challenge.weeklyTargetIncreasePercentage = event.params.PercentageIncrease;
  const deadlineDateEpoch = BigInt.fromI32(event.params.NumberofWeeks).times(
    BigInt.fromI32(ONE_WEEK_IN_SECONDS)
  );
  challenge.competitionDeadline = event.block.timestamp.plus(deadlineDateEpoch);
  challenge.nextIntervalReviewEpoch = event.block.timestamp.plus(
    BigInt.fromI32(ONE_WEEK_IN_SECONDS)
  );
  challenge.intervalReviewTally = 0;
  challenge.save();
}

export function handleUserWithdraw(event: FundsWithdrawn): void {
  const user = User.load(event.params.user.toHexString());
  if (!user) {
    log.error("User not found: {}", [event.params.user.toHexString()]);
    return;
  }
  user.stakedAmount = user.stakedAmount.minus(event.params.amount);
  user.updatedAt = event.block.timestamp;
  user.save();
}

export function handleChallengeComplete(event: ChallengeCompleted): void {
  const challenge = Challenge.load(event.params.challengeId.toHexString());
  if (!challenge) {
    log.error("Challenge not found: {}", [
      event.params.challengeId.toHexString(),
    ]);
    return;
  }
  challenge.success = event.params.status ? 1 : 0;
  challenge.status = false;
  challenge.updatedAt = event.block.timestamp;
  challenge.save();
}

export function handleIntervalReview(event: IntervalReviewCompleted): void {
  const id = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.block.timestamp.toString())
    .concat("-")
    .concat(event.logIndex.toString())
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  const intervalReview = new IntervalReviews(id);
  intervalReview.challengeId = event.params.challengeId;
  intervalReview.challenge = event.params.challengeId.toHexString();
  intervalReview.createdAt = event.block.timestamp;
  intervalReview.updatedAt = event.block.timestamp;
  intervalReview.status = event.params.success;
  intervalReview.transactionHash = event.transaction.hash.toHex();
  intervalReview.save();

  const challenge = Challenge.load(event.params.challengeId.toHexString());
  if (!challenge) {
    log.error("Challenge not found: {}", [
      event.params.challengeId.toHexString(),
    ]);
    return;
  }
  challenge.failedWeeks.plus(BigInt.fromI32(1));
  challenge.nextIntervalReviewEpoch = challenge.nextIntervalReviewEpoch.plus(
    BigInt.fromI32(ONE_WEEK_IN_SECONDS)
  );
  challenge.intervalReviewTally = challenge.intervalReviewTally + 1;
  if (challenge.weeklyTargetIncreasePercentage > 0) {
    challenge.startingMiles =
      challenge.startingMiles +
      challenge.startingMiles * challenge.weeklyTargetIncreasePercentage;
  }
  challenge.startingMiles = challenge.updatedAt = event.block.timestamp;
  challenge.save();
}
