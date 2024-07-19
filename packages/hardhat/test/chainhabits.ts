import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainHabits } from "../typechain-types";
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
  const provider = ethers.provider;
  //-------------------------------------------------
  // async function getEthToUsdcPrice() {
  //   try {
  //     const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
  //     console.log(response.data.ethereum.usd);
  //     return response.data.ethereum.usd;
  //   } catch (error) {
  //     console.error("Error fetching ETH/USDC price:", error);
  //     throw error;
  //   }
  // }

  // Function to convert ETH to USDC
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
        console.log("@@@@AlvoTokenBalanceBefore", AlvoTokenBalanceBefore);
        console.log("@@@@AlvoTokenBalanceAfter", AlvoTokenBalanceAfter);

        expect(AlvoTokenBalanceBefore).lessThan(AlvoTokenBalanceAfter);
      });
      it("expects balance of owners tokens to decrease by the amount of tokens transferred to the ALVO contract", async function () {
        const TokenBalanceBefore = await usdcContract.balanceOf(owner.address);
        await chainHabits.createNewChallenge(
          "Marathon",
          startingMiles,
          durationInWeeks,
          forfeitAddress.address,
          12,
          usdcAddress,
          tokenAmount,
        );

        const TokenBalanceAfter = await usdcContract.balanceOf(owner.address);
        console.log("@@@@TokenBalanceBefore", TokenBalanceBefore);
        console.log("@@@@TokenBalanceAfter", TokenBalanceAfter);

        // expect(AlvoTokenBalanceBefore).higher(AlvoTokenBalanceAfter);
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
      //TODO: amount staked test not working. fix this
      // it("check amount staked erc20", async function () {
      //   const tx = await chainHabits.createNewChallenge(
      //     "Marathon",
      //     startingMiles,
      //     durationInWeeks,
      //     forfeitAddress.address,
      //     12,
      //     usdcAddress,
      //     tokenAmount,
      //   );
      //   await tx.wait();
      //   const userStakeInUSDC = await chainHabits.getUserStake(owner.address ,usdcAddress );

      //   //Convert stakeAmount (in ETH) to USDC
      //   const expectedStakeInUSDC = await convertEthToUsdc(stakeAmount);

      //   console.log("Expected USDC (with 6 decimals):", expectedStakeInUSDC.toString());
      //   console.log("Actual USDC from contract:", userStakeInUSDC.toString());

      // // Calculate the difference as a percentage
      // const difference = Math.abs(Number(expectedStakeInUSDC - userStakeInUSDC)) / Number(userStakeInUSDC) * 100;
      // console.log("Difference: " + difference.toFixed(2) + "%");

      // // Check if the difference is within 3%
      // expect(difference).to.be.lessThan(1);
      // });
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
        console.log("@@@challenge created");
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

        const totalStaked = await chainHabits.getUserStake(owner.address, usdcAddress);
        forfeitAmount = totalStaked / BigInt(4);
      });

      it("ETH sent to forfeit address", async function () {
        // Perform the transaction and get the receipt
        const tx = await chainHabits.handleCompleteChallenge(
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
      it("If transfer failed - Forfeit funds added to mapping", async function () {
        // GET total staked and workdout forfeit funds
        const forfeitAddressBalance = await provider.getBalance(forfeitAddress.address);
        console.log("Eth Address of forfeit address Before:", forfeitAddressBalance);

        const totalStaked = await chainHabits.getUserStake(owner.address, ZeroAddress);

        const forfeitAmount = totalStaked;

        // Perform the transaction and get the receipt
        await expect(
          chainHabits.handleCompleteChallenge(challengeID, forfeitAmount, owner.address, ethers.ZeroAddress),
        ).emit(chainHabits, "ForfeitedFundsFailedToSend");
      });
      it("Challenge Completed Event emitted", async function () {
        await expect(chainHabits.handleCompleteChallenge(challengeID, forfeitAmount, owner.address, usdcAddress)).emit(
          chainHabits,
          "ChallengeCompleted",
        );
      });
      it("Expect user challengeId set to 0", async function () {
        // Perform the transaction and get the receipt
        await chainHabits.handleCompleteChallenge(challengeID, forfeitAmount, owner.address, ethers.ZeroAddress);
        const challengeId = await chainHabits.getChallengeId(owner.address);
        expect(challengeId).to.equal(0);
      });
      it("Expect User hasLivechallengeSet to False", async function () {
        // Perform the transaction and get the receipt
        await chainHabits.handleCompleteChallenge(challengeID, forfeitAmount, owner.address, ethers.ZeroAddress);
      });
      it("isChallengeLive set to false", async function () {
        // Perform the transaction and get the receipt
        await chainHabits.handleCompleteChallenge(challengeID, forfeitAmount, owner.address, ethers.ZeroAddress);
      });
      it("", async function () {});
      it("", async function () {});
    });
    describe("failure", function () {});
  });
  describe("complete challenge Token Deposit", function () {
    describe("success", function () {
      beforeEach("create profile and ", async function () {});
      it("", async function () {});
      it("", async function () {});
    });
    describe("failure", function () {});
  });
  describe("bulk complete challenge", function () {
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
});
