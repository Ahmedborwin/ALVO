import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainHabits } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ZeroAddress } from "ethers";

describe("ChainHabits", async function () {
  // We define a fixture to reuse the same setup in every test.
  let owner: HardhatEthersSigner, user2: HardhatEthersSigner, forfeitAddress: HardhatEthersSigner;
  const stakeAmount = ethers.parseEther("0.1");
  let chainHabits: ChainHabits;
  beforeEach(async () => {
    [owner, user2, forfeitAddress] = await ethers.getSigners();
    const chainHabitsFactory = await ethers.getContractFactory("ChainHabits");
    chainHabits = (await chainHabitsFactory.deploy()) as ChainHabits;
    await chainHabits.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Admin Assigned to Deployer Address", async function () {
      expect(await chainHabits.owner()).to.equal(owner.address);
    });
  });

  describe("Create Profile", function () {
    describe("Success", async function () {
      it("check username is set", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        const newUserDetails = await chainHabits.getUserDetails(owner);
        expect(newUserDetails).includes(62612170n, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
      });
      it("checks event is emitted", async function () {
        await expect(chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd")).to.emit(
          chainHabits,
          "NewUserRegistered",
        );
      });
    });
    describe("Failure", async function () {
      it("registered user cannot register again", async function () {
        expect(
          await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd"),
        ).to.be.revertedWithCustomError(chainHabits, "CHAINHABITS__UserAlreadyRegistered");
      });
    });
  });

  describe("Create New Challenge", function () {
    const startingMiles = 10n;
    const durationInWeeks = 8n;

    describe("success", function () {
      beforeEach("create profile", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
      });
      it("expects starting miles to be same as what was set", async function () {
        // Create a new challenge and get the challengeID directly
        // Create a new challenge and get the transaction
        const tx = await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          {
            value: stakeAmount,
          },
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Parse the logs to find the ChallengeCreated event
        const eventLog = receipt.logs.find(log => {
          try {
            return chainHabits.interface.parseLog(log).name === "NewChallengeCreated";
          } catch (e) {
            return false;
          }
        });

        // Parse the event log to extract the challengeID
        const parsedEvent = chainHabits.interface.parseLog(eventLog);
        const challengeID = parsedEvent.args[0]; // Since the event is indexed, challengeID is the first argument

        // Get the challenge details using the challengeID
        const challengeDetails = await chainHabits.getChallengeDetails(challengeID);

        expect(challengeDetails).includes(startingMiles);
      });
      it("emits new challenge created event", async function () {
        await expect(
          chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress, 12, {
            value: stakeAmount,
          }),
        ).emit(chainHabits, "NewChallengeCreated");
      });
      it("check amount staked", async function () {
        const stakeAmount = ethers.parseEther("0.1");
        const tx = await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          {
            value: stakeAmount,
          },
        );
        await tx.wait();
        const hasLiveChallenge = await chainHabits.userHasLiveChallenge(owner);
        expect(hasLiveChallenge).to.equal(true);
      });
      it("check amount staked", async function () {
        const tx = await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          {
            value: stakeAmount,
          },
        );
        await tx.wait();
        const userDetails = await chainHabits.getUserDetails(owner);
        console.log(userDetails[0]);
        expect(userDetails[0]).to.equal(stakeAmount);
      });
    });
    describe("failure", function () {
      //rejects call if user has a live objective
      it("Rejects if user not registered", async function () {
        expect(
          await chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress.address, 12, {
            value: stakeAmount,
          }),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__UserNotYetRegistered");
      });
      beforeEach("create profile", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
      });
      it("Rejects if user already has a live challenge", async function () {
        expect(
          await chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress.address, 12, {
            value: stakeAmount,
          }),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__UserHasLiveObjective");
      });
      it("Rejects if user does not deposit ether", async function () {
        // await chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress.address, 12);
        expect(
          await chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress.address, 12, {
            value: stakeAmount,
          }),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__StakeAmountisZero");
      });
      it("Rejects if forfeit address is 0 Address", async function () {
        await expect(
          chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, ZeroAddress, 12, {
            value: stakeAmount,
          }),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__ForfeitAddressIs0Address");
      });
    });
  });

  describe("interval review", function () {
    const startingMiles = 10n;
    const durationInWeeks = 8n;
    let challengeID: bigint;

    describe("success", function () {
      beforeEach("create user and create new challenge", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        await chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress.address, 12, {
          value: stakeAmount,
        });
        challengeID = await chainHabits.getChallengeId(owner.address);
      });
      it("If failed, increments failed weeks by 1", async function () {
        await chainHabits.handleIntervalReview(challengeID, owner.address, true);
        const challengeDetails = await chainHabits.getChallengeDetails(challengeID);
        expect(challengeDetails[2]).to.equal(1n);
      });
      it("if passed, does not increment failed weeks by 1", async function () {
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        const challengeDetails = await chainHabits.getChallengeDetails(challengeID);
        expect(challengeDetails[2]).to.equal(0n);
      });
      it("emits event for interval review completed", async function () {
        await expect(chainHabits.handleIntervalReview(challengeID, owner.address, false)).emit(
          chainHabits,
          "IntervalReviewCompleted",
        );
      });
    });
    describe("failure", function () {
      beforeEach("create user and create new challenge", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        await chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress.address, 12, {
          value: stakeAmount,
        });
        challengeID = await chainHabits.getChallengeId(owner.address);
      });
      it("If failed, increments failed weeks by 1", async function () {
        await chainHabits.handleIntervalReview(challengeID, owner.address, true);
        const challengeDetails = await chainHabits.getChallengeDetails(challengeID);
        expect(challengeDetails[2]).to.equal(1n);
      });
      it("Reverts if challengeId is not live", async function () {
        await expect(chainHabits.handleIntervalReview(2, owner.address, true)).to.be.revertedWithCustomError(
          chainHabits,
          "CHAINHABITS__ChallengeNotLive",
        );
      });
      it("Reverts wrong address and challengeId pair is provided", async function () {
        await chainHabits.connect(user2).registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        await chainHabits
          .connect(user2)
          .createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress.address, 12, {
            value: stakeAmount,
          });
        await expect(chainHabits.handleIntervalReview(2, owner.address, true)).revertedWithCustomError(
          chainHabits,
          "CHAINHABITS__IncorrectAddressORChallengeId",
        );
      });
    });
  });
  describe("complete challenge", function () {
    describe("success", function () {
      //check
      beforeEach("create profile", async function () {});
      it("", async function () {});
      it("", async function () {});
    });
    describe("failure", function () {});
  });
  describe("Test1", function () {
    describe("success", function () {
      //check
      beforeEach("create profile", async function () {});
      it("", async function () {});
      it("", async function () {});
    });
    describe("failure", function () {});
  });
  describe("test2", function () {
    describe("success", function () {
      //check
      beforeEach("create profile", async function () {});
      it("", async function () {});
      it("", async function () {});
    });
    describe("failure", function () {});
  });
  // describe("complete challenge", function () {
  //   const startingMiles = 10;
  //   const durationInWeeks = 8;
  //   let challengeID;

  //   describe("success", function () {
  //     beforeEach("create profile", async function () {
  //       await chainHabits.registerNewUser("Frank");
  //     });
  //     it("", async function () {});
  //     it("", async function () {});
  //   });
  //   describe("failure", function () {});
  // });
});
