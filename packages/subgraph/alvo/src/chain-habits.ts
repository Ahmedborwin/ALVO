import {
  ChallengeCompleted as ChallengeCompletedEvent,
  ForfeitedFundsFailedToSend as ForfeitedFundsFailedToSendEvent,
  FundsWithdrawn as FundsWithdrawnEvent,
  IntervalReviewCompleted as IntervalReviewCompletedEvent,
  NewChallengeCreated as NewChallengeCreatedEvent,
  NewUserRegistered as NewUserRegisteredEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/ChainHabits/ChainHabits"
import {
  ChallengeCompleted,
  ForfeitedFundsFailedToSend,
  FundsWithdrawn,
  IntervalReviewCompleted,
  NewChallengeCreated,
  NewUserRegistered,
  OwnershipTransferred
} from "../generated/schema"

export function handleChallengeCompleted(event: ChallengeCompletedEvent): void {
  let entity = new ChallengeCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.status = event.params.status
  entity.stakeForfeited = event.params.stakeForfeited

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleForfeitedFundsFailedToSend(
  event: ForfeitedFundsFailedToSendEvent
): void {
  let entity = new ForfeitedFundsFailedToSend(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFundsWithdrawn(event: FundsWithdrawnEvent): void {
  let entity = new FundsWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleIntervalReviewCompleted(
  event: IntervalReviewCompletedEvent
): void {
  let entity = new IntervalReviewCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.userAddress = event.params.userAddress
  entity.success = event.params.success

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewChallengeCreated(
  event: NewChallengeCreatedEvent
): void {
  let entity = new NewChallengeCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.Objective = event.params.Objective
  entity.startingMiles = event.params.startingMiles
  entity.NumberofWeeks = event.params.NumberofWeeks
  entity.PercentageIncrease = event.params.PercentageIncrease
  entity.defaultAddress = event.params.defaultAddress
  entity.amount = event.params.amount
  entity.erc20Address = event.params.erc20Address

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNewUserRegistered(event: NewUserRegisteredEvent): void {
  let entity = new NewUserRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
