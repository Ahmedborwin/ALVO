import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ChallengeCompleted } from "../generated/schema"
import { ChallengeCompleted as ChallengeCompletedEvent } from "../generated/ChainHabits/ChainHabits"
import { handleChallengeCompleted } from "../src/chain-habits"
import { createChallengeCompletedEvent } from "./chain-habits-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let challengeId = BigInt.fromI32(234)
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let status = "boolean Not implemented"
    let stakeForfeited = BigInt.fromI32(234)
    let newChallengeCompletedEvent = createChallengeCompletedEvent(
      challengeId,
      user,
      status,
      stakeForfeited
    )
    handleChallengeCompleted(newChallengeCompletedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ChallengeCompleted created and stored", () => {
    assert.entityCount("ChallengeCompleted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ChallengeCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "challengeId",
      "234"
    )
    assert.fieldEquals(
      "ChallengeCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ChallengeCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "status",
      "boolean Not implemented"
    )
    assert.fieldEquals(
      "ChallengeCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "stakeForfeited",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
