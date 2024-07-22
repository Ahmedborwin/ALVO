import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ChallengeCompleted,
  ForfeitedFundsFailedToSend,
  FundsWithdrawn,
  IntervalReviewCompleted,
  NewChallengeCreated,
  NewUserRegistered,
  OwnershipTransferred
} from "../generated/ChainHabits/ChainHabits"

export function createChallengeCompletedEvent(
  challengeId: BigInt,
  user: Address,
  status: boolean,
  stakeForfeited: BigInt
): ChallengeCompleted {
  let challengeCompletedEvent = changetype<ChallengeCompleted>(newMockEvent())

  challengeCompletedEvent.parameters = new Array()

  challengeCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  challengeCompletedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  challengeCompletedEvent.parameters.push(
    new ethereum.EventParam("status", ethereum.Value.fromBoolean(status))
  )
  challengeCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "stakeForfeited",
      ethereum.Value.fromUnsignedBigInt(stakeForfeited)
    )
  )

  return challengeCompletedEvent
}

export function createForfeitedFundsFailedToSendEvent(
  user: Address,
  amount: BigInt
): ForfeitedFundsFailedToSend {
  let forfeitedFundsFailedToSendEvent = changetype<ForfeitedFundsFailedToSend>(
    newMockEvent()
  )

  forfeitedFundsFailedToSendEvent.parameters = new Array()

  forfeitedFundsFailedToSendEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  forfeitedFundsFailedToSendEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return forfeitedFundsFailedToSendEvent
}

export function createFundsWithdrawnEvent(
  user: Address,
  amount: BigInt
): FundsWithdrawn {
  let fundsWithdrawnEvent = changetype<FundsWithdrawn>(newMockEvent())

  fundsWithdrawnEvent.parameters = new Array()

  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return fundsWithdrawnEvent
}

export function createIntervalReviewCompletedEvent(
  challengeId: BigInt,
  userAddress: Address,
  success: boolean
): IntervalReviewCompleted {
  let intervalReviewCompletedEvent = changetype<IntervalReviewCompleted>(
    newMockEvent()
  )

  intervalReviewCompletedEvent.parameters = new Array()

  intervalReviewCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  intervalReviewCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "userAddress",
      ethereum.Value.fromAddress(userAddress)
    )
  )
  intervalReviewCompletedEvent.parameters.push(
    new ethereum.EventParam("success", ethereum.Value.fromBoolean(success))
  )

  return intervalReviewCompletedEvent
}

export function createNewChallengeCreatedEvent(
  challengeId: BigInt,
  user: Address,
  Objective: string,
  startingMiles: i32,
  NumberofWeeks: i32,
  PercentageIncrease: i32,
  defaultAddress: Address,
  amount: BigInt,
  erc20Address: Address
): NewChallengeCreated {
  let newChallengeCreatedEvent = changetype<NewChallengeCreated>(newMockEvent())

  newChallengeCreatedEvent.parameters = new Array()

  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam("Objective", ethereum.Value.fromString(Objective))
  )
  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startingMiles",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(startingMiles))
    )
  )
  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "NumberofWeeks",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(NumberofWeeks))
    )
  )
  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "PercentageIncrease",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(PercentageIncrease))
    )
  )
  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "defaultAddress",
      ethereum.Value.fromAddress(defaultAddress)
    )
  )
  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  newChallengeCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "erc20Address",
      ethereum.Value.fromAddress(erc20Address)
    )
  )

  return newChallengeCreatedEvent
}

export function createNewUserRegisteredEvent(user: Address): NewUserRegistered {
  let newUserRegisteredEvent = changetype<NewUserRegistered>(newMockEvent())

  newUserRegisteredEvent.parameters = new Array()

  newUserRegisteredEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )

  return newUserRegisteredEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
