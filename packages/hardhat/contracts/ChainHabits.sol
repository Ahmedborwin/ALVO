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
error CHAINHABITS__UserHasLiveObjective();

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
	// as we are using subgraph do we need this array ?
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
	mapping(address => uint256) ForfeitedFundsToBeCollected;

	//EVENTS
	// removed indexed from the Objective as it's a string and removed starting date from the event as we can get the timestamp for the event from the subgraph
	// added amount also
	event NewChallengeCreated(
		uint256 indexed challengeId,
		address indexed user,
		string Objective, // TODO -- restrict size of this
		uint8 startingMiles,
		uint8 NumberofWeeks,
		uint8 PercentageIncrease,
		address defaultAddress,
		uint256 amount
	);
	// indexed user
	event NewUserRegistered(address indexed user); //TODO do we need more data in this event?
	event IntervalReviewCompleted(
		uint256 indexed challengeId,
		address userAddress,
		bool success
	);
	// indexed stakeForfeited added status
	event ChallengeCompleted(
		uint256 indexed challengeId,
		address indexed user,
		bool status
	);
	event FundsWithdrawn(address indexed user, uint256 amount);
	event ForfeitedFundsFailedToSend(address indexed user, uint256 amount);

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
		address _defaultAddress,
		uint8 PercentageIncrease
	)
		external
		payable
		isUserRegistered(msg.sender)
		returns (uint256 challengeId)
	{
		//one challenge at a time only
		if (userHasLiveChallenge[msg.sender]) {
			revert CHAINHABITS__UserHasLiveObjective();
		}

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
			PercentageIncrease,
			_defaultAddress,
			msg.value
		);
	}

	//handle challenge review logic what about passing args as arr of objs and iteration of it instead of calling individualy will that reduce the excecution gas.
	function handleIntervalReview(
		uint256 _challengeId,
		address _user,
		bool failed
	) external onlyOwner {
		if (failed) {
			challengeTable[_challengeId].failedWeeks++;
		}
		emit IntervalReviewCompleted(_challengeId, _user, failed);
	}

	//TODO - testing a bulk interval review function
	//Is this actually cheaper?
	function handleBulkIntervalReview(
		uint256[] calldata _challengeId,
		address[] calldata _user,
		bool[] calldata failed
	) external onlyOwner {
		for (uint16 i = 0; i < _challengeId.length; i++) {
			if (failed[i]) {
				challengeTable[_challengeId[i]].failedWeeks++;
			}
			emit IntervalReviewCompleted(_challengeId[i], _user[i], failed[i]);
		}
	}

	//handle close challenge
	function handleCompleteChallenge(
		uint256 challengeId,
		uint8 stakeForfeited,
		address userAddress
	) external onlyOwner nonReentrant {
		if (stakeForfeited > 0) {
			(bool sent, ) = (challengeTable[challengeId].defaultAddress).call{
				value: stakeForfeited
			}("");
			if (!sent) {
				ForfeitedFundsToBeCollected[
					challengeTable[challengeId].defaultAddress
				] += stakeForfeited;
				//TODO to subgraph && have front end recognise if address has funds it can withdraw
				emit ForfeitedFundsFailedToSend(
					challengeTable[challengeId].defaultAddress,
					stakeForfeited
				);
			}
			//update address staked balance
			userTable[userAddress].currentStaked -= stakeForfeited;
		} else {
			usersCurrentChallenge[msg.sender] = 0; //set current ChallengeId to 0 TODO is this neneeded?
			userHasLiveChallenge[msg.sender] = false; //set users challenge to false
		}
		emit ChallengeCompleted(challengeId, userAddress, true);
	}

	//TODO: Bulk handleCompleteChallenge

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

	//setter - TODO this needs to be removed when we incorporate the encrypted database
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
