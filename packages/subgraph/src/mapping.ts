import { Address, BigInt, log, BigDecimal } from "@graphprotocol/graph-ts";
import {
  NewUserRegistered,
  NewChallengeCreated,
  FundsWithdrawn,
  ChallengeCompleted,
  IntervalReviewCompleted,
  LocationChallengeCoordinates,
  RecordCoordinates,
} from "../generated/ChainHabits/ChainHabits";
import {
  User,
  Challenge,
  IntervalReviews,
  RecordedCoordinates,
} from "../generated/schema";

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
const zeroAddress = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export function handleUserRegistration(event: NewUserRegistered): void {
  const userCreate = new User(event.params.user.toHexString());
  userCreate.userAddress = event.params.user;
  userCreate.stakedAmount = BigInt.zero();
  userCreate.stakedTokens = BigInt.zero();
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

  if (event.params.erc20Address == zeroAddress) {
    user.stakedAmount = user.stakedAmount.plus(event.params.amount);
  } else {
    user.stakedTokens = user.stakedTokens.plus(event.params.amount);
  }
  user.updatedAt = event.block.timestamp;
  user.save();

  const challenge = new Challenge(event.params.challengeId.toHexString());
  challenge.challengeId = event.params.challengeId;
  challenge.userAddress = event.params.user;
  challenge.ChallengeType = event.params.challengeType;
  challenge.user = event.params.user.toHexString();
  challenge.objective = event.params.Objective;
  challenge.initialTarget = event.params.startingTarget;
  challenge.numberOfWeeks = event.params.NumberofWeeks;
  challenge.defaultAddress = event.params.defaultAddress;
  challenge.failedWeeks = BigInt.fromI32(0);
  challenge.success = 2;
  challenge.stakedAmount = event.params.amount;
  challenge.createdAt = event.block.timestamp;
  challenge.updatedAt = event.block.timestamp;
  challenge.status = true;
  challenge.transactionHash = event.transaction.hash.toHex();
  challenge.weeklyTargetIncreasePercentage = event.params.PercentageIncrease;
  challenge.ERC20Address = event.params.erc20Address;
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

export function handleNewLocationChallengeCoordinates(
  event: LocationChallengeCoordinates
): void {
  const challenge = Challenge.load(event.params.challengeId.toHexString());
  if (!challenge) {
    log.error("Challenge not found: {}", [
      event.params.challengeId.toHexString(),
    ]);
    return;
  }
  let precisionFactor = BigDecimal.fromString("10000000");
  challenge.latitude = BigInt.fromI32(event.params.latitude)
    .toBigDecimal()
    .div(precisionFactor);
  challenge.longitude = BigInt.fromI32(event.params.longitude)
    .toBigDecimal()
    .div(precisionFactor);

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
  //Do we need both createdAt and updatedAt??
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
    challenge.initialTarget =
      challenge.initialTarget +
      (challenge.initialTarget * challenge.weeklyTargetIncreasePercentage) /
        100;
  }
  challenge.updatedAt = event.block.timestamp;
  challenge.save();
}

export function handleChallengeComplete(event: ChallengeCompleted): void {
  const challenge = Challenge.load(event.params.challengeId.toHexString());
  if (!challenge) {
    log.error("Challenge not found: {}", [
      event.params.challengeId.toHexString(),
    ]);
    return;
  }

  challenge.stakedAmount = challenge.stakedAmount.minus(
    event.params.stakeForfeited
  );
  challenge.success = event.params.status ? 1 : 0;
  challenge.status = false;
  challenge.updatedAt = event.block.timestamp;
  challenge.save();

  const user = User.load(event.params.user.toHexString());
  if (!user) {
    log.error("User not found: {}", [event.params.user.toHexString()]);
    return;
  }

  if (event.params.erc20Address == zeroAddress) {
    user.stakedAmount = user.stakedAmount.minus(event.params.stakeForfeited);
  } else {
    user.stakedTokens = user.stakedTokens.minus(event.params.stakeForfeited);
  }
  user.updatedAt = event.block.timestamp;
  user.save();
}

// Event to record co-ordinates emitted by user for location based goal
//location co-ordinates are added to RecordedCoordinates table which is
//linked back to the challenge table
export function handleRecordCoordinates(event: RecordCoordinates): void {
  const challenge = Challenge.load(event.params.challengeId.toHexString());
  if (!challenge) {
    log.error("Challenge not found: {}", [
      event.params.challengeId.toHexString(),
    ]);
    return;
  }
  //Create Id for new Coordinate Log Event
  const id = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.block.timestamp.toString())
    .concat("-")
    .concat(event.logIndex.toString())
    .concat("-")
    .concat(event.transactionLogIndex.toString());
  //Create new instance of
  const recordedCoordinates = new RecordedCoordinates(id);
  recordedCoordinates.CoordinatesLoggedDate = event.block.timestamp;
  recordedCoordinates.latitude = event.params.latitude;
  recordedCoordinates.longitude = event.params.longitude;
  recordedCoordinates.challenge = event.params.challengeId.toHexString();
  recordedCoordinates.save();
}

export function handleUserWithdraw(event: FundsWithdrawn): void {
  const user = User.load(event.params.user.toHexString());
  if (!user) {
    log.error("User not found: {}", [event.params.user.toHexString()]);
    return;
  }

  if (event.params.erc20Address == zeroAddress) {
    user.stakedAmount = user.stakedAmount.minus(event.params.amount);
  } else {
    user.stakedTokens = user.stakedTokens.minus(event.params.amount);
  }
  user.updatedAt = event.block.timestamp;
  user.save();
}
