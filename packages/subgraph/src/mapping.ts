import { BigInt } from "@graphprotocol/graph-ts";
import {
  NewUserRegistered,
  NewChallengeCreated,
  FundsWithdrawn,
  ChallengeCompleted,
  intervalReviewCompleted,
} from "../generated/ChainHabits/ChainHabits";
import { User, Challenge, IntervalReviews } from "../generated/schema";

// function genIDFromParams(id: BigInt, address: Address): string {
//   return id.toHexString() + "-" + address.toHexString();
// }

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
  if (!user) return;
  user.stakedAmount = user.stakedAmount.plus(event.params.amount);
  user.updatedAt = event.block.timestamp;

  const challenge = new Challenge(event.params.challengeId.toHexString());
  challenge.challengeId = event.params.challengeId;
  challenge.userAddress = event.params.user;
  challenge.user = event.params.user.toHexString();
  challenge.objective = event.params.Objective;
  challenge.startingMiles = event.params.startingMiles;
  challenge.numberOfWeeks = event.params.NumberofWeeks;
  challenge.defaultAddress = event.params.defaultAddress;
  challenge.success = 2;
  challenge.stakedAmount = event.params.amount;
  challenge.createdAt = event.block.timestamp;
  challenge.updatedAt = event.block.timestamp;
  challenge.status = true;
  challenge.transactionHash = event.transaction.hash.toHex();
  challenge.save();
  user.save();
}

export function handleUserWithdraw(event: FundsWithdrawn): void {
  const user = User.load(event.params.user.toHexString());
  if (!user) return;
  user.stakedAmount = user.stakedAmount.minus(event.params.amount);
  user.updatedAt = event.block.timestamp;
  user.save();
}

export function handleChallengeComplete(event: ChallengeCompleted): void {
  const challenge = Challenge.load(event.params.challengeId.toHexString());
  if (!challenge) return;
  challenge.success = event.params.status ? 1 : 0;
  challenge.status = false;
  challenge.updatedAt = event.block.timestamp;
  challenge.save();
}

export function handleIntervalReview(event: intervalReviewCompleted): void {
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
  // intervalReview.success = event.block.success;
  // intervalReview.userAddress = event.block.userAddress;
  intervalReview.status = true;
  intervalReview.transactionHash = event.transaction.hash.toHex();
  intervalReview.save();
}
