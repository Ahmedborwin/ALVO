import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainHabits } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ChainHabits", async function () {
  // We define a fixture to reuse the same setup in every test.
  let owner: HardhatEthersSigner, user2: HardhatEthersSigner;

  let chainHabits: ChainHabits;
  beforeEach(async () => {
    [owner, user2] = await ethers.getSigners();
    const chainHabitsFactory = await ethers.getContractFactory("ChainHabits");
    chainHabits = (await chainHabitsFactory.deploy()) as ChainHabits;
    await chainHabits.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Admin Assigned to Deployer Address", async function () {
      expect(await chainHabits.admin()).to.equal(owner.address);
    });
  });

  describe("Create Profile", function () {
    describe("Success", async function () {
      it("check username is set", async function () {
        await chainHabits.registerNewUser("Ahmed");
        const newUserDetails = await chainHabits.getUserDetails();
        expect(newUserDetails).includes("Ahmed");
      });
      it("checks event is emitted", async function () {
        await expect(chainHabits.registerNewUser("Ahmed")).to.emit(chainHabits, "NewUserRegistered");
      });
    });
    describe("Failure", async function () {
      this.beforeEach("create profile", async function () {
        await chainHabits.registerNewUser("Frank");
      });
      it("checks if username is already taken", async function () {
        expect(await chainHabits.connect(user2).registerNewUser("Frank")).to.be.revertedWithCustomError(
          chainHabits,
          "CHAINHABITS__UsernameTaken",
        );
      });
      it("registered user cannot register again", async function () {
        expect(await chainHabits.registerNewUser("Fathi")).to.be.revertedWithCustomError(
          chainHabits,
          "CHAINHABITS__UserAlreadyRegistered",
        );
      });
    });
  });

  describe("Create New Challenge", function () {
    const startingMiles = 10;
    const durationInWeeks = 8;
    let challengeID;

    describe("success", function () {
      beforeEach("create profile", async function () {
        await chainHabits.registerNewUser("Frank");
      });
      it("expects starting miles to be same as what was set", async function () {
        challengeID = await chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks);
        const challengeDetails = await chainHabits.getChallengeDetails(challengeID);
        console.log(challengeDetails);
        expect(challengeDetails).includes(startingMiles, durationInWeeks.toString());
      });
      it("emits new challenge created event", async function () {
        await expect(chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks)).emit(
          chainHabits,
          "NewChallengeCreated",
        );
      });
    });
    describe("failure", function () {});
  });
});
