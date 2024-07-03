// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.19;

// import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
// import { ConfirmedOwner } from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
// import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
// import "@openzeppelin/contracts/utils/Strings.sol";
// import "hardhat/console.sol";
// /**
//  * @title Chainlink Functions example on-demand consumer contract example
//  */
// contract APIConsumer is FunctionsClient, ConfirmedOwner {
// 	using FunctionsRequest for FunctionsRequest.Request;
// 	using Strings for bytes;

// 	//Modifiers
// 	modifier onlyAdmin(address _caller) {
// 		require(
// 			_caller == contract_Admin,
// 			"Only Contract Admins Can Make This Call"
// 		);
// 		_;
// 	}

// 	bytes32 public donId; // DON ID for the Functions DON to which the requests are sent

// 	bytes32 public s_lastRequestId;
// 	bytes public s_lastResponse;
// 	bytes public s_lastError;

// 	address public _router;

// 	//Functions Variables
// 	string public StravaCall;
// 	uint64 public subscriptionId;
// 	uint32 public callbackGasLimit;

// 	//Interfaces
// 	//Admin
// 	address public contract_Admin;

// 	//EVENTS
// 	event ResponseReceived(bytes32 _requestId, bytes _response);
// 	event _RequestSent(bytes32 requestID);

// 	constructor(
// 		address router,
// 		bytes32 _donId
// 	) FunctionsClient(router) ConfirmedOwner(msg.sender) {
// 		_router = router;
// 		donId = _donId;
// 		contract_Admin = msg.sender;
// 	}
// 	/**
// 	 * @notice Set the DON ID
// 	 * @param newDonId New DON ID
// 	 */
// 	function setDonId(bytes32 newDonId) external onlyOwner {
// 		donId = newDonId;
// 	}

// 	function sendRequest(string[] calldata args) external {
// 		_internalSendRequest(args, msg.sender);
// 	}

// 	/**
// 	 * @notice Triggers an on-demand Functions request
// 	 * @param args String arguments passed into the source code and accessible via the global variable `args`
// 	 */
// 	function _internalSendRequest(
// 		string[] calldata args,
// 		address _caller
// 	) internal onlyAdmin(_caller) {
// 		FunctionsRequest.Request memory req;
// 		req.initializeRequest(
// 			FunctionsRequest.Location.Inline,
// 			FunctionsRequest.CodeLanguage.JavaScript,
// 			StravaCall
// 		);
// 		if (args.length > 0) {
// 			req.setArgs(args);
// 		}
// 		s_lastRequestId = _sendRequest(
// 			req.encodeCBOR(),
// 			subscriptionId,
// 			callbackGasLimit,
// 			donId
// 		);
// 		emit _RequestSent(s_lastRequestId);
// 	}

// 	/**
// 	 * @notice Store latest result/error
// 	 * @param requestId The request ID, returned by sendRequest()
// 	 * @param response Aggregated response from the user code
// 	 * @param err Aggregated error from the user code or from the execution pipeline
// 	 * Either response or error parameter will be set, but never both
// 	 */
// 	function fulfillRequest(
// 		bytes32 requestId,
// 		bytes memory response,
// 		bytes memory err
// 	) internal override {
// 		s_lastResponse = response;
// 		s_lastError = err;

// 		if (response.length > 0) {
// 			emit ResponseReceived(requestId, response);
// 		}
// 	}

// 	//UTIL FUNCTIONS

// 	function populateStravaCall(
// 		string calldata _stravaCall
// 	) external onlyOwner {
// 		StravaCall = _stravaCall;
// 	}
// 	function populateSubIdANDGasLimit(
// 		uint64 _subId,
// 		uint32 _callbackGasLimit
// 	) external onlyOwner {
// 		subscriptionId = _subId;
// 		callbackGasLimit = _callbackGasLimit;
// 	}

// 	//Setter Functions

// 	function setContractAdmin(
// 		address _newAdmin
// 	) external onlyAdmin(msg.sender) {
// 		contract_Admin = _newAdmin;
// 	}

// 	function bytes32ToString(
// 		bytes32 _bytes32
// 	) public pure returns (string memory) {
// 		uint8 i = 0;
// 		while (i < 32 && _bytes32[i] != 0) {
// 			i++;
// 		}
// 		bytes memory bytesArray = new bytes(i);
// 		for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
// 			bytesArray[i] = _bytes32[i];
// 		}
// 		return string(bytesArray);
// 	}
// }
