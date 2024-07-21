import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainHabits, FailingRecipient } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ZeroAddress } from "ethers";
// import axios from "axios";

describe("ChainHabits", async function () {
  // We define a fixture to reuse the same setup in every test.
  let owner: HardhatEthersSigner, user2: HardhatEthersSigner, forfeitAddress: HardhatEthersSigner, usdcContract;
  const stakeAmount = ethers.parseEther("0.1");
  let chainHabits: ChainHabits, chainHabitsAddress: string;
  let usdcAddress: string, tokenAmount: bigint;
  const startingMiles = 10n;
  const durationInWeeks = 8n;
  // const provider = ethers.provider;
  //-------------------------------------------------
  // async function getEthToUsdcPrice() {
  //   try {
  //     const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
  //     return response.data.ethereum.usd;
  //   } catch (error) {
  //     console.error("Error fetching ETH/USDC price:", error);
  //     throw error;
  //   }
  // }

  // // Function to convert ETH to USDC
  // async function convertEthToUsdc(ethAmountWei) {
  //   const ethPrice = await getEthToUsdcPrice();
  //   const ethAmount = Number(ethers.formatEther(ethAmountWei));
  //   return BigInt(Math.round(ethAmount * ethPrice * 1e6)); // USDC has 6 decimal places
  // }
  //-------------------------------------------------

  before(async () => {
    [owner, user2, forfeitAddress] = await ethers.getSigners();
    const impersonated = await ethers.getImpersonatedSigner("0xc6d78e3d7edee32767f7338a1e070f33adb906d7");

    // USDC contract ABI
    const erc20ABI = [
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function allowance(address owner, address spender) external view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
    ];
    tokenAmount = ethers.parseUnits("40", 6); // 1000 USDC (USDC has 6 decimals)
    usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC contract address on Ethereum mainnet
    usdcContract = new ethers.Contract(usdcAddress, erc20ABI, impersonated);
  });

  //-------------------------------------------------

  beforeEach(async () => {
    const chainHabitsFactory = await ethers.getContractFactory("ChainHabits");
    chainHabits = (await chainHabitsFactory.connect(owner).deploy()) as ChainHabits;
    await chainHabits.waitForDeployment();

    chainHabitsAddress = await chainHabits.getAddress();

    const tx = await usdcContract.transfer(owner.address, tokenAmount);
    await tx.wait();

    await chainHabits.addPriceFeedAddress(usdcAddress, "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6");

    // increase allowance
    await usdcContract.connect(owner).approve(chainHabitsAddress, tokenAmount);
  });

  //--------------------------------------------------

  describe("Deployment", function () {
    it("Admin Assigned to Deployer Address", async function () {
      expect(await chainHabits.owner()).to.equal(owner.address);
    });
  });

  //-------------------------------------------------
  describe("Create Profile", function () {
    describe("Success", async function () {
      //  beforeEach(async () => {
      //
      //   })
      it("check username is set", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        const newUserDetails = await chainHabits.getUserDetails(owner.address);
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

  //-------------------------------------------------

  describe("Create New Challenge using Deposit ETH", function () {
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
          ZeroAddress,
          0,
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
          chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress,
            12,
            ZeroAddress,
            0,
            {
              value: stakeAmount,
            },
          ),
        ).emit(chainHabits, "NewChallengeCreated");
      });
      it("check amount staked", async function () {
        const tx = await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          ZeroAddress,
          0,
          {
            value: stakeAmount,
          },
        );
        await tx.wait();
        const stakeAmountETH = await chainHabits.getUserStake(owner, ZeroAddress);
        expect(stakeAmountETH).to.equal(stakeAmount);
      });
    });

    describe("failure", function () {
      //rejects call if user has a live objective
      it("Rejects if user not registered", async function () {
        expect(
          await chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress.address,
            12,
            ZeroAddress,
            0,
            {
              value: stakeAmount,
            },
          ),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__UserNotYetRegistered");
      });
      beforeEach("create profile", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
      });
      it("Rejects if user already has a live challenge", async function () {
        expect(
          await chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress.address,
            12,
            ZeroAddress,
            0,
            {
              value: stakeAmount,
            },
          ),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__UserHasLiveObjective");
      });
      it("Rejects if user does not deposit ether", async function () {
        await expect(
          chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress.address,
            12,
            ZeroAddress,
            0,
            {
              value: 0,
            },
          ),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__StakeAmountisZero");
      });
      it("Rejects if forfeit address is 0 Address", async function () {
        await expect(
          chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, ZeroAddress, 12, ZeroAddress, 0, {
            value: stakeAmount,
          }),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__ForfeitAddressInvalid");
      });
      it("Rejects if forfeit address is same as challenge creator address", async function () {
        await expect(
          chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            owner.address,
            12,
            ZeroAddress,
            0,
            {
              value: stakeAmount,
            },
          ),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__ForfeitAddressInvalid");
      });
    });
  });

  //-------------------------------------------------
  //is the tokens transferFrom working?

  describe("Create New Challenge using ERC20 Deposit", function () {
    describe("success", function () {
      beforeEach("create profile", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
      });
      it("expects starting miles to be same as what was set", async function () {
        const tx = await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          usdcAddress,
          tokenAmount,
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
      it("expects balance of alvo tokens to decrease by the amount of tokens transferred to the ALVO contract", async function () {
        const AlvoTokenBalanceBefore = await usdcContract.balanceOf(chainHabitsAddress);
        await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          usdcAddress,
          tokenAmount,
        );

        const AlvoTokenBalanceAfter = await usdcContract.balanceOf(chainHabitsAddress);

        expect(AlvoTokenBalanceBefore).lessThan(AlvoTokenBalanceAfter);
      });
      it("expects balance of owners tokens to decrease by the amount of tokens transferred to the ALVO contract", async function () {
        const tx = await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          usdcAddress,
          tokenAmount,
        );

        await tx.wait();

        expect(tx).changeTokenBalances(usdcContract, [owner.address, chainHabits.target], [tokenAmount, -tokenAmount]);
      });
      it("emits new challenge created event", async function () {
        await expect(
          chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress,
            12,
            usdcAddress,
            tokenAmount,
          ),
        ).emit(chainHabits, "NewChallengeCreated");
      });
    });
    describe("failure", function () {
      //rejects call if user has a live objective
      it("Rejects if user not registered", async function () {
        expect(
          await chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress.address,
            12,
            ZeroAddress,
            0,
            {
              value: stakeAmount,
            },
          ),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__UserNotYetRegistered");
      });
      beforeEach("create profile", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
      });
      it("Rejects if user already has a live challenge", async function () {
        expect(
          await chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress.address,
            12,
            ZeroAddress,
            0,
            {
              value: stakeAmount,
            },
          ),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__UserHasLiveObjective");
      });
      it("Rejects if user does not deposit token or ether", async function () {
        // await chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, forfeitAddress.address, 12);
        await expect(
          chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress.address,
            12,
            ZeroAddress,
            0,
          ),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__StakeAmountisZero");
      });
      it("Rejects if forfeit address is 0 Address", async function () {
        await expect(
          chainHabits.createNewChallenge("Marathon", startingMiles, durationInWeeks, ZeroAddress, 12, ZeroAddress, 0, {
            value: stakeAmount,
          }),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__ForfeitAddressInvalid");
      });
      it("Rejects if forfeit address is same as challenge creator address", async function () {
        await expect(
          chainHabits.createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            owner.address,
            12,
            ZeroAddress,
            0,
            {
              value: stakeAmount,
            },
          ),
        ).revertedWithCustomError(chainHabits, "CHAINHABITS__ForfeitAddressInvalid");
      });
    });
  });

  //-------------------------------------------------

  describe("interval review", function () {
    let challengeID: bigint;

    describe("success", function () {
      beforeEach("create user and create new challenge", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          usdcContract,
          tokenAmount,
        );
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
        await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          ZeroAddress,
          0,
          {
            value: stakeAmount,
          },
        );
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
      it("Reverts if the wrong address and challengeId pair is provided", async function () {
        await chainHabits.connect(user2).registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");

        //------------------------
        const tx = await usdcContract.transfer(user2.address, tokenAmount);
        await tx.wait();

        await usdcContract.connect(user2).approve(chainHabitsAddress, tokenAmount);
        //------------------------

        await chainHabits
          .connect(user2)
          .createNewChallenge(
            "Marathon",
            startingMiles,
            durationInWeeks,
            forfeitAddress.address,
            12,
            usdcContract,
            tokenAmount,
          );

        await expect(chainHabits.handleIntervalReview(2, owner.address, true)).revertedWithCustomError(
          chainHabits,
          "CHAINHABITS__IncorrectAddressORChallengeId",
        );
      });
    });
  });

  //-------------------------------------------------

  describe("complete challenge ETH Deposit", function () {
    let challengeID: bigint, forfeitAmount: bigint;
    describe("success", function () {
      beforeEach("create profile and ", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          ZeroAddress,
          0,
          {
            value: stakeAmount,
          },
        );
        challengeID = await chainHabits.getChallengeId(owner.address);
        await chainHabits.handleIntervalReview(challengeID, owner.address, true);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);

        const totalStaked = await chainHabits.getUserStake(owner.address, ZeroAddress);
        forfeitAmount = totalStaked / BigInt(4);
      });
      it("ETH sent to forfeit address", async function () {
        // Perform the transaction and get the receipt
        const tx = await chainHabits.handleCompleteChallengeETH(
          challengeID,
          forfeitAmount,
          owner.address,
          ethers.ZeroAddress,
        );
        await tx.wait();
        // Check balance changes
        // Check balance changes
        await expect(tx).to.changeEtherBalances(
          [chainHabits.target, forfeitAddress],
          [-forfeitAmount, forfeitAmount], // Using BigInt negation
        );
      });
      it("Challenge Completed Event emitted", async function () {
        await expect(
          chainHabits.handleCompleteChallengeETH(challengeID, forfeitAmount, owner.address, ZeroAddress),
        ).emit(chainHabits, "ChallengeCompleted");
      });
      it("Expect user challengeId set to 0", async function () {
        // Perform the transaction and get the receipt
        await chainHabits.handleCompleteChallengeETH(challengeID, forfeitAmount, owner.address, ethers.ZeroAddress);
        const challengeId = await chainHabits.getChallengeId(owner.address);
        expect(challengeId).to.equal(0);
      });
      it("Expect User hasLivechallengeSet to False", async function () {
        // Perform the transaction and get the receipt
        await chainHabits.handleCompleteChallengeETH(challengeID, forfeitAmount, owner.address, ethers.ZeroAddress);
        const userHasLiveChallenge = await chainHabits.userHasLiveChallenge(owner.address);
        expect(userHasLiveChallenge).equal(false);
      });
      it("isChallengeLive set to false", async function () {
        // Perform the transaction and get the receipt
        const tx = await chainHabits.handleCompleteChallengeETH(
          challengeID,
          forfeitAmount,
          owner.address,
          ethers.ZeroAddress,
        );
        await tx.wait();
        const isChallengeLive = await chainHabits._isChallengeLive(challengeID);
        expect(isChallengeLive).equal(false);
      });
      it("if stake forfeited is 0 then user can withdraw all of their stake", async function () {
        const totalStaked = await chainHabits.getUserStake(owner.address, ZeroAddress);
        await chainHabits.handleCompleteChallengeETH(challengeID, 0, owner.address, ethers.ZeroAddress);

        const tx = await chainHabits.withdrawFunds(ZeroAddress);

        await tx.wait();

        await expect(tx).to.changeEtherBalances([chainHabits.target, owner.address], [-totalStaked, totalStaked]);
      });
      it("withdraw event emitted", async function () {
        await chainHabits.handleCompleteChallengeETH(challengeID, 0, owner.address, ethers.ZeroAddress);

        await expect(chainHabits.withdrawFunds(ZeroAddress)).emit(chainHabits, "FundsWithdrawn");
      });
    });
    describe("failure", function () {
      beforeEach("Register User, challenge and complete interval reviews", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          ZeroAddress,
          0,
          {
            value: stakeAmount,
          },
        );
        challengeID = await chainHabits.getChallengeId(owner.address);
        await chainHabits.handleIntervalReview(challengeID, owner.address, true);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);

        const totalStaked = await chainHabits.getUserStake(owner.address, ZeroAddress);
        forfeitAmount = totalStaked / BigInt(4);
      });
      it("If stake forfeited is higher than total stake then revert", async function () {
        const totalStaked = await chainHabits.getUserStake(owner.address, ZeroAddress);
        const forfeitAmount = totalStaked + 100n;
        await expect(
          chainHabits.handleCompleteChallengeETH(challengeID, forfeitAmount, owner.address, ethers.ZeroAddress),
        ).to.revertedWithCustomError(chainHabits, "CHAINHABITS__ForfeitExceedsStake");
      });
      it("If transfer failed - ForfeitedFundsFailedToSend Event emitted", async function () {
        await chainHabits.connect(user2).registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        const failingRecipientFactory = await ethers.getContractFactory("FailingRecipient");
        const failingRecipient = (await failingRecipientFactory.connect(owner).deploy()) as FailingRecipient;
        await failingRecipient.waitForDeployment();

        await chainHabits
          .connect(user2)
          .createNewChallenge("Marathon", startingMiles, durationInWeeks, failingRecipient.target, 12, ZeroAddress, 0, {
            value: stakeAmount,
          });

        challengeID = await chainHabits.getChallengeId(user2.address);
        await chainHabits.handleIntervalReview(challengeID, user2.address, true);
        await chainHabits.handleIntervalReview(challengeID, user2.address, false);
        await chainHabits.handleIntervalReview(challengeID, user2.address, false);
        await chainHabits.handleIntervalReview(challengeID, user2.address, false);

        const totalStaked = await chainHabits.getUserStake(user2.address, ZeroAddress);
        forfeitAmount = totalStaked;

        // Perform the transaction and get the receipt
        await expect(
          chainHabits.handleCompleteChallengeETH(challengeID, forfeitAmount, user2.address, ethers.ZeroAddress),
        ).emit(chainHabits, "ForfeitedFundsFailedToSend");
      });
      it("If transfer failed - Forfeit funds added to mapping", async function () {
        await chainHabits.connect(user2).registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        const failingRecipientFactory = await ethers.getContractFactory("FailingRecipient");
        const failingRecipient = (await failingRecipientFactory.connect(owner).deploy()) as FailingRecipient;
        await failingRecipient.waitForDeployment();

        await chainHabits
          .connect(user2)
          .createNewChallenge("Marathon", startingMiles, durationInWeeks, failingRecipient.target, 12, ZeroAddress, 0, {
            value: stakeAmount,
          });

        challengeID = await chainHabits.getChallengeId(user2.address);
        await chainHabits.handleIntervalReview(challengeID, user2.address, true);
        await chainHabits.handleIntervalReview(challengeID, user2.address, false);
        await chainHabits.handleIntervalReview(challengeID, user2.address, false);
        await chainHabits.handleIntervalReview(challengeID, user2.address, false);

        const totalStaked = await chainHabits.getUserStake(user2.address, ZeroAddress);
        forfeitAmount = totalStaked;

        await chainHabits.handleCompleteChallengeETH(challengeID, forfeitAmount, user2.address, ZeroAddress);
        // Perform the transaction and get the receipt
        const ForfeitFundsToBeCollected = await chainHabits.ForfeitedFundsToBeCollected(failingRecipient.target);
        expect(ForfeitFundsToBeCollected).equal(forfeitAmount);
      });
      it("", async function () {});
      it("", async function () {});
      it("", async function () {});
      it("", async function () {});
    });
  });

  //-------------------------------------------------

  describe("complete challenge ERC20 Deposit", function () {
    let challengeID: bigint, forfeitAmount: bigint;

    describe("success", function () {
      beforeEach("create profile and ", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          usdcAddress,
          tokenAmount,
        );
        challengeID = await chainHabits.getChallengeId(owner.address);
        await chainHabits.handleIntervalReview(challengeID, owner.address, true);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);

        const totalStaked = await chainHabits.getUserStake(owner.address, usdcAddress);
        forfeitAmount = totalStaked / BigInt(4);
      });
      it("USDC sent to forfeit address", async function () {
        // Perform the transaction and get the receipt
        const tx = await chainHabits.handleCompleteChallengeERC20(
          challengeID,
          forfeitAmount,
          owner.address,
          usdcAddress,
        );
        await tx.wait();

        // Check balance changes
        await expect(tx).to.changeTokenBalances(
          usdcContract,
          [chainHabits.target, forfeitAddress],
          [-forfeitAmount, forfeitAmount],
        );
      });
      it("Challenge Completed Event emitted", async function () {
        await expect(
          chainHabits.handleCompleteChallengeERC20(challengeID, forfeitAmount, owner.address, usdcAddress),
        ).emit(chainHabits, "ChallengeCompleted");
      });
      it("Expect user challengeId set to 0", async function () {
        // Perform the transaction and get the receipt
        await chainHabits.handleCompleteChallengeERC20(challengeID, forfeitAmount, owner.address, usdcAddress);
        const challengeId = await chainHabits.getChallengeId(owner.address);
        expect(challengeId).to.equal(0);
      });
      it("Expect User hasLivechallengeSet to False", async function () {
        // Perform the transaction and get the receipt
        await chainHabits.handleCompleteChallengeERC20(challengeID, forfeitAmount, owner.address, usdcAddress);
        const userHasLiveChallenge = await chainHabits.userHasLiveChallenge(owner.address);
        expect(userHasLiveChallenge).equal(false);
      });
      it("isChallengeLive set to false", async function () {
        // Perform the transaction and get the receipt
        const tx = await chainHabits.handleCompleteChallengeERC20(
          challengeID,
          forfeitAmount,
          owner.address,
          usdcAddress,
        );
        await tx.wait();
        const isChallengeLive = await chainHabits._isChallengeLive(challengeID);
        expect(isChallengeLive).equal(false);
      });
      it("if stake forfeited is 0 then user can withdraw all of their stake", async function () {
        const totalStaked = await chainHabits.getUserStake(owner.address, usdcAddress);
        await chainHabits.handleCompleteChallengeERC20(challengeID, 0, owner.address, usdcAddress);

        const tx = await chainHabits.withdrawFunds(usdcAddress);

        await tx.wait();

        await expect(tx).to.changeTokenBalances(
          usdcContract,
          [chainHabits.target, owner.address],
          [-totalStaked, totalStaked],
        );
      });
      it("withdraw event emitted", async function () {
        await chainHabits.handleCompleteChallengeERC20(challengeID, 0, owner.address, usdcAddress);

        await expect(chainHabits.withdrawFunds(usdcAddress)).emit(chainHabits, "FundsWithdrawn");
      });
    });
    describe("failure", function () {
      beforeEach("Register User, challenge and complete interval reviews", async function () {
        await chainHabits.registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
        await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          usdcAddress,
          tokenAmount,
        );
        challengeID = await chainHabits.getChallengeId(owner.address);
        await chainHabits.handleIntervalReview(challengeID, owner.address, true);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);
        await chainHabits.handleIntervalReview(challengeID, owner.address, false);

        const totalStaked = await chainHabits.getUserStake(owner.address, usdcAddress);
        forfeitAmount = totalStaked / BigInt(4);
      });
      it("If stake forfeited is higher than total stake then revert", async function () {
        const totalStaked = await chainHabits.getUserStake(owner.address, usdcAddress);
        const forfeitAmount = totalStaked + 100n;
        await expect(
          chainHabits.handleCompleteChallengeERC20(challengeID, forfeitAmount, owner.address, usdcAddress),
        ).to.revertedWithCustomError(chainHabits, "CHAINHABITS__ForfeitExceedsStake");
      });
      // it("If transfer failed - ForfeitedFundsFailedToSend Event emitted", async function () {
      //   await chainHabits.connect(user2).registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
      //   const failingRecipientFactory = await ethers.getContractFactory("FailingRecipient");
      //   const failingRecipient = (await failingRecipientFactory.connect(owner).deploy()) as FailingRecipient;
      //   await failingRecipient.waitForDeployment();

      //   await chainHabits
      //     .connect(user2)
      //     .createNewChallenge(
      //       "Marathon",
      //       startingMiles,
      //       durationInWeeks,
      //       failingRecipient.target,
      //       12,
      //       usdcAddress,
      //       tokenAmount,
      //     );

      //   challengeID = await chainHabits.getChallengeId(user2.address);
      //   await chainHabits.handleIntervalReview(challengeID, user2.address, true);
      //   await chainHabits.handleIntervalReview(challengeID, user2.address, false);
      //   await chainHabits.handleIntervalReview(challengeID, user2.address, false);
      //   await chainHabits.handleIntervalReview(challengeID, user2.address, false);

      //   const totalStaked = await chainHabits.getUserStake(user2.address, usdcAddress);
      //   forfeitAmount = totalStaked;

      //   // Perform the transaction and get the receipt
      //   await expect(
      //     chainHabits.handleCompleteChallengeERC20(challengeID, forfeitAmount, user2.address, usdcAddress),
      //   ).emit(chainHabits, "ForfeitedFundsFailedToSend");
      // });
      // it("If transfer failed - Forfeit funds added to mapping", async function () {
      //   await chainHabits.connect(user2).registerNewUser(62612170, "0ac2f45bea762e3f0c7abbc1d2e6b78ee8f2a7fd");
      //   const failingRecipientFactory = await ethers.getContractFactory("FailingRecipient");
      //   const failingRecipient = (await failingRecipientFactory.connect(owner).deploy()) as FailingRecipient;
      //   await failingRecipient.waitForDeployment();

      //   await chainHabits
      //     .connect(user2)
      //     .createNewChallenge(
      //       "Marathon",
      //       startingMiles,
      //       durationInWeeks,
      //       failingRecipient.target,
      //       12,
      //       usdcAddress,
      //       tokenAmount,
      //     );

      //   challengeID = await chainHabits.getChallengeId(user2.address);
      //   await chainHabits.handleIntervalReview(challengeID, user2.address, true);
      //   await chainHabits.handleIntervalReview(challengeID, user2.address, false);
      //   await chainHabits.handleIntervalReview(challengeID, user2.address, false);
      //   await chainHabits.handleIntervalReview(challengeID, user2.address, false);

      //   const totalStaked = await chainHabits.getUserStake(user2.address, usdcAddress);
      //   forfeitAmount = totalStaked;

      //   await chainHabits.handleCompleteChallengeERC20(challengeID, forfeitAmount, user2.address, usdcAddress);
      //   // Perform the transaction and get the receipt
      //   const ForfeitFundsToBeCollected = await chainHabits.ForfeitedFundsToBeCollected(failingRecipient.target);
      //   expect(ForfeitFundsToBeCollected).equal(forfeitAmount);
      // });
      it("", async function () {});
      it("", async function () {});
      it("", async function () {});
      it("", async function () {});
    });
  });
  //-------------------------------------------------

  describe("bulk complete challenge", function () {
    describe("success", function () {
      //check
      beforeEach("create profile", async function () {});
      it("", async function () {});
      it("", async function () {});
    });
    describe("failure", function () {});
  });

  //-------------------------------------------------
});
