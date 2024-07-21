//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

//TODO datatructure to record all active players

// Errors
error CHAINHABITS__UserAlreadyRegistered();
error CHAINHABITS__UserNotYetRegistered();
error CHAINHABITS__NoActiveChallengeForUser();
error CHAINHABITS__ChallengeStillActive();
error CHAINHABITS__InsufficientFunds();
error CHAINHABITS__UserHasLiveObjective();
error CHAINHABITS__StakeAmountisZero();
error CHAINHABITS__ForfeitAddressInvalid();
error CHAINHABITS__ChallengeNotLive();
error CHAINHABITS__IncorrectAddressORChallengeId();
error CHAINHABITS__InsufficientERC20Balance();
error CHAINHABITS__InsufficientERC20Allowance();
error CHAINHABITS__ERC20TransferFailed();
error CHAINHABITS__ERC20TokenNotSupported();
error CHAINHABITS__ERC20DepositAmountIs0();
error CHAINHABITS__PrivateInformation();
error CHAINHABITS__ForfeitExceedsStake();

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

	// as we are using subgraph do we need this array ?
	// address[] public allUsers;

	//datafeed
	AggregatorV3Interface internal dataFeed;

	// STRUCTS
	struct UserDetails {
		// uint256 currentStaked;
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
	mapping(address player => UserDetails) private userTable;
	mapping(uint256 challengeId => ChallengeDetails) public challengeTable;
	mapping(address user => uint256 challengeId) usersCurrentChallenge;
	mapping(address => uint256) public ForfeitedFundsToBeCollected;
	mapping(address => address) priceFeedAddress;
	mapping(address => mapping(address => uint256)) currentStakedByUser;

	//EVENTS
	event NewChallengeCreated(
		uint256 indexed challengeId,
		address indexed user,
		string Objective,
		uint8 startingMiles,
		uint8 NumberofWeeks,
		uint8 PercentageIncrease,
		address defaultAddress,
		uint256 amount,
		address erc20Address
	);
	// indexed user
	event NewUserRegistered(address indexed user);
	event IntervalReviewCompleted(
		uint256 indexed challengeId,
		address userAddress,
		bool success
	);
	// indexed stakeForfeited added status
	event ChallengeCompleted(
		uint256 indexed challengeId,
		address indexed user,
		bool status,
		uint256 stakeForfeited
	);
	event FundsWithdrawn(address indexed user, uint256 amount);
	event ForfeitedFundsFailedToSend(address indexed user, uint256 amount);

	constructor() Ownable() {}

	//Create New User Pofile
	function registerNewUser(
		uint256 userID,
		string calldata _refreshToken
	) external isUserNotRegistered(msg.sender) {
		userTable[msg.sender] = UserDetails(userID, _refreshToken);
		isUserRegisteredTable[msg.sender] = true;
		// allUsers.push(msg.sender);
		emit NewUserRegistered(msg.sender);
	}

	function createNewChallenge(
		string calldata _obj,
		uint8 _targetMiles,
		uint8 _weeks,
		address _forfeitAddress,
		uint8 _percentageIncrease,
		address _erc20Address,
		uint256 _depositAmount
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

		if (_forfeitAddress == address(0) || _forfeitAddress == msg.sender) {
			revert CHAINHABITS__ForfeitAddressInvalid();
		}

		uint256 requiredTokenAmount;
		uint256 depositAmount;

		//TODO : Cannot send token and msg.value? or can?
		if (_erc20Address != address(0)) {
			if (_depositAmount == 0) {
				revert CHAINHABITS__ERC20DepositAmountIs0();
			}
			address _priceFeedAddress = priceFeedAddress[_erc20Address];

			if (_priceFeedAddress == address(0)) {
				revert CHAINHABITS__ERC20TokenNotSupported();
			}

			uint256 erc20Price = uint256(
				getChainlinkDataFeedLatestAnswer(_priceFeedAddress)
			);

			requiredTokenAmount =
				(_depositAmount * 1 ether) /
				(erc20Price * 1e10);

			IERC20 usdcToken = IERC20(_erc20Address);
			if (usdcToken.balanceOf(msg.sender) < requiredTokenAmount) {
				revert CHAINHABITS__InsufficientERC20Balance();
			}

			if (
				usdcToken.allowance(msg.sender, address(this)) <
				requiredTokenAmount
			) {
				revert CHAINHABITS__InsufficientERC20Allowance();
			}

			if (
				!usdcToken.transferFrom(
					msg.sender,
					address(this),
					requiredTokenAmount
				)
			) {
				revert CHAINHABITS__ERC20TransferFailed();
			}

			depositAmount = _depositAmount;
			currentStakedByUser[msg.sender][
				_erc20Address
			] += requiredTokenAmount;
		} else {
			if (msg.value == 0) {
				revert CHAINHABITS__StakeAmountisZero();
			}
		}

		_challengeIdCounter.increment();
		challengeId = _challengeIdCounter.current();

		challengeTable[challengeId] = ChallengeDetails(
			_targetMiles,
			_weeks,
			0,
			true,
			uint48(block.timestamp), //initialy start date
			_forfeitAddress
		);

		usersCurrentChallenge[msg.sender] = challengeId; //record current challenge for user

		if (_erc20Address == address(0)) {
			depositAmount = msg.value;
			currentStakedByUser[msg.sender][address(0)] += (msg.value);
		}

		userHasLiveChallenge[msg.sender] = true;

		//emit new challenge events
		emit NewChallengeCreated(
			challengeId,
			msg.sender,
			_obj,
			_targetMiles,
			_weeks,
			_percentageIncrease,
			_forfeitAddress,
			depositAmount,
			_erc20Address
		);
	}

	//handle challenge review logic what about passing args as arr of objs and iteration of it instead of calling individualy will that reduce the excecution gas.
	function handleIntervalReview(
		uint256 _challengeId,
		address _user,
		bool failed
	) external onlyOwner {
		//Could check if challengeId is live
		if (!_isChallengeLive(_challengeId)) {
			revert CHAINHABITS__ChallengeNotLive();
		}
		//if user is owner of challenge
		if (_getChallengeId(_user) != _challengeId) {
			revert CHAINHABITS__IncorrectAddressORChallengeId();
		}
		if (failed) {
			challengeTable[_challengeId].failedWeeks++;
		}
		emit IntervalReviewCompleted(_challengeId, _user, failed);
	}

	//TODO - testing a bulk interval review function
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
	function handleCompleteChallengeETH(
		uint256 _challengeID,
		uint256 _stakeForfeited,
		address _userAddress,
		address _erc20Address
	) external onlyOwner nonReentrant {
		if (_stakeForfeited > 0) {
			address forfeitAddress = challengeTable[_challengeID]
				.defaultAddress;
			//check that _stakeForfeit is less than amount staked by user
			if (
				_stakeForfeited >
				currentStakedByUser[_userAddress][_erc20Address]
			) {
				revert CHAINHABITS__ForfeitExceedsStake();
			}

			currentStakedByUser[_userAddress][_erc20Address] -= _stakeForfeited;
			challengeTable[_challengeID].isLive = false;
			
			//IF ETH Deposit
			(bool sent, ) = forfeitAddress.call{ value: _stakeForfeited }("");

			if (!sent) {
				ForfeitedFundsToBeCollected[forfeitAddress] += _stakeForfeited;
				emit ForfeitedFundsFailedToSend(
					forfeitAddress,
					_stakeForfeited
				);
			}
		}

		usersCurrentChallenge[_userAddress] = 0;
		userHasLiveChallenge[_userAddress] = false;
		emit ChallengeCompleted(_challengeID, _userAddress, true, _stakeForfeited);
	}

	function handleCompleteChallengeERC20(
		uint256 _challengeID,
		uint256 _stakeForfeited,
		address _userAddress,
		address _erc20Address
	) external onlyOwner nonReentrant {
		if (_stakeForfeited > 0) {
			address forfeitAddress = challengeTable[_challengeID]
				.defaultAddress;
			//check that _stakeForfeit is less than amount staked by user
			if (
				_stakeForfeited >
				currentStakedByUser[_userAddress][_erc20Address]
			) {
				revert CHAINHABITS__ForfeitExceedsStake();
			}

			currentStakedByUser[_userAddress][_erc20Address] -= _stakeForfeited;
			challengeTable[_challengeID].isLive = false;

			IERC20 usdcToken = IERC20(_erc20Address);
			bool success = usdcToken.transfer(forfeitAddress, _stakeForfeited);
			if (!success) {
				ForfeitedFundsToBeCollected[forfeitAddress] += _stakeForfeited;
				console.log("forfeitTransactionFailed");
				emit ForfeitedFundsFailedToSend(
					forfeitAddress,
					_stakeForfeited
				);
			}
		}

		usersCurrentChallenge[_userAddress] = 0;
		userHasLiveChallenge[_userAddress] = false;
		emit ChallengeCompleted(_challengeID, _userAddress, true, _stakeForfeited);
	}

	//withdraw funds
	function withdrawFunds(
		address _erc20Address
	) external nonReentrant isUserRegistered(msg.sender) {
		if (userHasLiveChallenge[msg.sender]) {
			revert CHAINHABITS__ChallengeStillActive();
		}

		uint256 withdrawAmount = currentStakedByUser[msg.sender][_erc20Address];

		if (withdrawAmount == 0) {
			revert CHAINHABITS__InsufficientFunds();
		}

		currentStakedByUser[msg.sender][_erc20Address] = 0; //else set to amount staked to 0

		if (_erc20Address == address(0)) {
			(bool success, ) = msg.sender.call{ value: withdrawAmount }("");
			require(success, "Transfer failed");
		} else {
			IERC20 usdcToken = IERC20(_erc20Address);
			require(
				usdcToken.transfer(msg.sender, withdrawAmount),
				"transferFailed"
			);
		}

		emit FundsWithdrawn(msg.sender, withdrawAmount);
	}

	//setter - TODO this needs to be removed when we incorporate the encrypted database
	function updateRefreshToken(
		address _user,
		string calldata _refreshToken
	) external onlyOwner {
		userTable[_user].refreshToken = _refreshToken;
	}

	//
	function addPriceFeedAddress(
		address erc20Address,
		address _priceFeedAddress
	) external onlyOwner {
		priceFeedAddress[erc20Address] = _priceFeedAddress;
	}

	//Helper - Internal
	function _isChallengeLive(uint256 _challengeId) public view returns (bool) {
		return challengeTable[_challengeId].isLive;
	}

	function _getChallengeId(
		address _userAddress
	) internal view returns (uint256) {
		return usersCurrentChallenge[_userAddress];
	}

	//get priceFeed data
	function getChainlinkDataFeedLatestAnswer(
		address _priceFeedAddress
	) internal returns (int) {
		dataFeed = AggregatorV3Interface(_priceFeedAddress);
		(
			,
			/* uint80 roundID */ int answer /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
			,
			,

		) = dataFeed.latestRoundData();
		return answer;
	}

	//GETTER FUNCTIONS
	function getUserDetails(
		address _user
	) external view returns (UserDetails memory) {
		return userTable[_user];
	}

	//GETTER FUNCTIONS
	function getUserStake(
		address _user,
		address _token
	) public view returns (uint256) {
		if (msg.sender != owner() && msg.sender != _user) {
			revert CHAINHABITS__PrivateInformation();
		}
		return currentStakedByUser[_user][_token]; // address(0) is expected for the eth balance
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
