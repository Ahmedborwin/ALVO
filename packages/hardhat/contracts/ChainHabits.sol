//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

	//create user profile
	mapping(string => bool) public isUserNameTaken;
	mapping(address => bool) public isUserRegisteredTable;

	// STRUCTS
	struct UserDetails {
		string username;
		uint256 challengeTally;
		uint256 SuccessfulChallenges;
		uint256 TotalStaked;
		uint256 TotalDonated;
		uint256 userID;
		string accessToken;
		string refreshToken;
	}

	struct ChallengeDetails {
		string objective;
		uint8 startingMiles;
		uint8 NoOfWeeks;
		bool isLive;
		uint256 deadline;
	}

	mapping(address player => UserDetails) userTable;
	mapping(uint256 challengeId => ChallengeDetails) challengeTable;
	mapping(address user => uint256[] challengeIdArray) usersChallenges;

	//EVENTS
	event NewChallengeCreated(
		string Objective,
		uint8 startingMiles,
		uint8 NumberofWeeks,
		uint256 Deadline
	);
	event NewUserRegistered(address user, string username);

	constructor() {
		admin = msg.sender;
	}

	//Create New Manager Pofile
	function registerNewUser(
		string calldata _username,
		uint256 userID,
		string calldata _accessToken,
		string calldata _refreshToken
	) external isUserNotRegistered(msg.sender) {
		if (isUserNameTaken[_username]) {
			revert CHAINHABITS__UsernameTaken();
		}

		userTable[msg.sender] = UserDetails(
			_username,
			0,
			0,
			0,
			0,
			userID,
			_accessToken,
			_refreshToken
		);
		isUserRegisteredTable[msg.sender] = true;

		//emit New Manager Event
		emit NewUserRegistered(msg.sender, _username);
	}

	function createNewChallenge(
		string calldata _obj,
		uint8 _startingMiles,
		uint8 _weeks
	) external payable isUserRegistered(msg.sender) returns (uint256) {
		uint256 challengeId = challengeCounter;
		challengeCounter++;
		//calculate deadline
		uint256 deadline = block.timestamp + (604800 * _weeks);
		challengeTable[challengeId] = ChallengeDetails(
			_obj,
			_startingMiles,
			_weeks,
			true,
			deadline
		);
		usersChallenges[msg.sender].push(challengeId); //push new challengeID to users list of challenges
		//emit new challenge events
		emit NewChallengeCreated(_obj, _startingMiles, _weeks, deadline);
		return challengeId;
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
}
