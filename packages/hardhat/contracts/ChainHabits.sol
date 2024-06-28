//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//TODO datatructure to record all active players

error CHAINHABITS__UsernameTaken();
error CHAINHABITS__UserAlreadyRegistered();
error CHAINHABITS__UserNotYetRegistered();
error CHAINHABITS__CallerNotAdmin(address Caller);

contract ChainHabits {
	//MODIFIERS
	modifier onlyAdmin(address _caller) {
		if (_caller != address(admin)) {
			revert CHAINHABITS__CallerNotAdmin(_caller);
		}
		_;
	}
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
	uint256 challengeCounter;
	address public admin;
	address[] public allUsers;

	// STRUCTS
	struct UserDetails {
		uint256 challengeTally;
		uint256 SuccessfulChallenges;
		uint256 currenStaked;
		uint256 totalDonated;
		uint256 userID; //fromstrava
		string refreshToken; //fromstrava
	}

	struct ChallengeDetails {
		string objective;
		uint8 targetMiles;
		uint8 NoOfWeeks;
		uint8 failedWeeks;
		bool isLive;
		uint48 competitionDeadline;
		uint48 currentIntervalEpoch;
		uint48 nextIntervalEpoch;
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
		uint256 challengeId,
		string Objective,
		uint8 startingMiles,
		uint8 NumberofWeeks,
		uint48 competitionDeadline,
		uint48 currentIntervalEpoch,
		uint48 nextIntervalEpoch,
		address defaultAddress
	);
	event NewUserRegistered(address user);

	constructor() {
		admin = msg.sender;
	}

	//Create New Manager Pofile
	function registerNewUser(
		uint256 userID,
		string calldata _refreshToken
	) external isUserNotRegistered(msg.sender) {
		userTable[msg.sender] = UserDetails(0, 0, 0, 0, userID, _refreshToken);
		isUserRegisteredTable[msg.sender] = true;

		//emit New Manager Event
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
		challengeId = challengeCounter;
		challengeCounter++;

		challengeTable[challengeId] = ChallengeDetails(
			_obj,
			_targetMiles,
			_weeks,
			0,
			true,
			uint48(block.timestamp) + (604800 * 4),
			uint48(block.timestamp),
			uint48(block.timestamp) + 604800,
			_defaultAddress
		);
		usersCurrentChallenge[msg.sender] = challengeId; //record current challenge for user
		userTable[msg.sender].currenStaked += msg.value; //record call.value as amount staked by user
		userHasLiveChallenge[msg.sender] = true;

		//emit new challenge events
		emit NewChallengeCreated(
			challengeId,
			_obj,
			_targetMiles,
			_weeks,
			uint48(block.timestamp) + (604800 * 7),
			uint48(block.timestamp),
			uint48(block.timestamp) + 604800,
			_defaultAddress
		);
	}

	//handle challenge review logic
	function handleIntervalReview(
		uint256 _challengeId,
		bool failed,
		uint48 currentIntervalEpoch,
		uint48 nextIntervalEpoch
	) external onlyAdmin(msg.sender) {
		//increment challengeDI with failure :(
		if (failed) {
			challengeTable[_challengeId].failedWeeks++;
		}
		//update intervals
		challengeTable[_challengeId]
			.currentIntervalEpoch = currentIntervalEpoch;
		challengeTable[_challengeId].nextIntervalEpoch = nextIntervalEpoch;
	}

	//handle close challenge
	function handleCompleteChallenge(
		uint256 challengeId,
		uint256 _amountToDefault
	) external onlyAdmin(msg.sender) {
		ChallengeDetails memory _challenge = challengeTable[challengeId];
		//send eth to address's
		if (_amountToDefault > 0) {
			(bool sent, ) = (_challenge.defaultAddress).call{
				value: _amountToDefault
			}("");
			require(sent, "failed to send eth");
			//event here?
		}
		userHasLiveChallenge[msg.sender] = false; //set users challenge to false
		_challenge.isLive = false;
		challengeTable[challengeId] = _challenge;
	}

	//withdraw funds
	function withdrawFunds() external isUserRegistered(msg.sender) {
		//only withdraw funds if no live challenge
	}

	//setter
	function updateRefreshToken(
		address _user,
		string calldata _refreshToken
	) external onlyAdmin(msg.sender) {
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
}
