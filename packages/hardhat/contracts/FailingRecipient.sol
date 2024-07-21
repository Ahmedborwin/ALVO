contract FailingRecipient {
    // This fallback function will always revert, simulating a failed transaction
    fallback() external payable {
        revert("I always fail");
    }

    receive() external payable {
        revert("I always fail");
    }
}