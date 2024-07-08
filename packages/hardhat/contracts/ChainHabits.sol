//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//TODO datatructure to record all active players

// Errors
error CHAINHABITS__UserAlreadyRegistered();
error CHAINHABITS__UserNotYetRegistered();
error CHAINHABITS__NoActiveChallengeForUser();
error CHAINHABITS__ChallengeStillActive();
error CHAINHABITS__InsufficientFunds();

contract ChainHabits is ReentrancyGuard, Ownable {
	using Counters for Counters.Counter;

	//MODIFIERS

	modifier isUserNotRegistered(address _caller) {
		if (isUserRegisteredTable[_caller]) {
			revert CHAINHABITS__UserAlreadyRegistered();
		}
		_;
	}
	modifier isUserRegistered(address _caller) {
		if (!isUserRegisteredTable[_caller]) {
			revert CHAINHABITS__UserNotYetRegistered();
		}
		_;
	}
	Counters.Counter private _challengeIdCounter;
	address public admin;
	address[] public allUsers;

	// STRUCTS
	struct UserDetails {
		uint48 currentStaked;
		uint256 userID; //fromstrava
		string refreshToken; //fromstrava
	}

	struct ChallengeDetails {
		uint8 targetMiles;
		uint8 NoOfWeeks;
		uint8 failedWeeks;
		bool isLive;
		uint48 challengeStartDate;
		address defaultAddress;
	}

	//create user profile
	mapping(address => bool) public isUserRegisteredTable;
	mapping(address => bool) public userHasLiveChallenge;
	mapping(address player => UserDetails) userTable;
	mapping(uint256 challengeId => ChallengeDetails) challengeTable;
	mapping(address user => uint256 challengeId) usersCurrentChallenge;

	//EVENTS
	event NewChallengeCreated(
		uint256 indexed challengeId,
		address indexed user,
		string indexed Objective, // TODO -- restrict size of this
		uint8 startingMiles,
		uint8 NumberofWeeks,
		uint48 challengeStartDate,
		address defaultAddress
	);
	event NewUserRegistered(address user); //TODO do we need more data in this event?
	event intervalReviewCompleted(
		uint256 indexed challengeId,
		address indexed user,
		bool success
	);
	event ChallengeCompleted(
		uint256 indexed challengeId,
		address indexed user,
		uint8 stakeForfeited
	);
	event FundsWithdrawn(address indexed user, uint256 amount);

	constructor() Ownable() {}

	//Create New User Pofile
	function registerNewUser(
		uint256 userID,
		string calldata _refreshToken
	) external isUserNotRegistered(msg.sender) {
		userTable[msg.sender] = UserDetails(0, userID, _refreshToken);
		isUserRegisteredTable[msg.sender] = true;
		allUsers.push(msg.sender);
		//emit New User Event
		emit NewUserRegistered(msg.sender);
	}

	function createNewChallenge(
		string calldata _obj,
		uint8 _targetMiles,
		uint8 _weeks,
		address _defaultAddress
	)
		external
		payable
		isUserRegistered(msg.sender)
		returns (uint256 challengeId)
	{
		_challengeIdCounter.increment();
		challengeId = _challengeIdCounter.current();

		challengeTable[challengeId] = ChallengeDetails(
			_targetMiles,
			_weeks,
			0,
			true,
			uint48(block.timestamp), //initialy start date
			_defaultAddress
		);
		usersCurrentChallenge[msg.sender] = challengeId; //record current challenge for user
		userTable[msg.sender].currentStaked += uint48(msg.value); //record call.value as amount staked by user
		userHasLiveChallenge[msg.sender] = true;

		//emit new challenge events
		emit NewChallengeCreated(
			challengeId,
			msg.sender,
			_obj,
			_targetMiles,
			_weeks,
			uint48(block.timestamp), //initialy start date
			_defaultAddress
		);
	}

	//handle challenge review logic
	function handleIntervalReview(
		uint256 _challengeId,
		bool failed
	) external onlyOwner {
		// uint48 currentIntervalEpoch,
		// uint48 nextIntervalEpoch
		ChallengeDetails memory challengeMemPointer;
		if (failed) {
			challengeMemPointer.failedWeeks++;
		}
		console.log("failedweek", challengeMemPointer.failedWeeks);
		// //update intervals
		// challengeMemPointer.currentIntervalEpoch = currentIntervalEpoch;
		// challengeMemPointer.nextIntervalEpoch = nextIntervalEpoch;
		challengeTable[_challengeId] = challengeMemPointer;
	}

	//handle close challenge
	function handleCompleteChallenge(
		uint256 challengeId,
		uint8 stakeForfeited,
		address userAddress
	) external onlyOwner {
		ChallengeDetails memory _challenge = challengeTable[challengeId];
		//send eth to address's
		if (stakeForfeited > 0) {
			(bool sent, ) = (_challenge.defaultAddress).call{
				value: stakeForfeited
			}("");
			require(sent, "failed to send eth");
			//update address staked balance
			UserDetails memory userDetails = userTable[userAddress];
			userDetails.currentStaked -= stakeForfeited;
			userTable[userAddress] = userDetails; //update userTable
			emit ChallengeCompleted(challengeId, userAddress, stakeForfeited);
		}
		userHasLiveChallenge[msg.sender] = false; //set users challenge to false
		_challenge.isLive = false; //TODO - could remove this
		challengeTable[challengeId] = _challenge;
	}

	//withdraw funds
	function withdrawFunds()
		external
		nonReentrant
		isUserRegistered(msg.sender)
	{
		UserDetails memory user = userTable[msg.sender];

		if (userHasLiveChallenge[msg.sender]) {
			revert CHAINHABITS__ChallengeStillActive();
		}

		uint48 amount = user.currentStaked;

		if (amount == 0) {
			revert CHAINHABITS__InsufficientFunds();
		}

		user.currentStaked = 0; //else set to amoutn staked to 0

		(bool success, ) = msg.sender.call{ value: amount }("");
		require(success, "Transfer failed");

		emit FundsWithdrawn(msg.sender, amount);
	}

	//setter
	function updateRefreshToken(
		address _user,
		string calldata _refreshToken
	) external onlyOwner {
		userTable[_user].refreshToken = _refreshToken;
	}

	//GETTER FUNCTIONS
	function getUserDetails(
		address _user
	) external view returns (UserDetails memory) {
		return userTable[_user];
	}

	function getChallengeDetails(
		uint256 _challengeId
	) external view returns (ChallengeDetails memory) {
		return challengeTable[_challengeId];
	}

	function getChallengeId(
		address _userAddress
	) external view returns (uint256) {
		return usersCurrentChallenge[_userAddress];
	}

	function getAllUserDetails() external view returns (address[] memory) {
		return allUsers;
	}
}
