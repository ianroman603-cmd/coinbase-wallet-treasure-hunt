// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MochiHunt
 * @dev A contract that allows users to claim ERC-20 tokens.
 */
contract MochiHunt is Ownable {
    using SafeERC20 for IERC20;

    // Mapping to store the claimed treasures
    mapping(string => bool) private claimedTreasures;

    // The ERC-20 token contract
    IERC20 public token;

    // event emitted when tokens are sent
    event TreasureClaimed(address indexed to, uint256 amount, string treasure);

    /**
     * @dev Initializes the contract by setting the token address.
     * @param _token The address of the ERC-20 token contract.
     */
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Token address cannot be zero.");
        token = IERC20(_token);
    }

    /**
     * @notice Sends tokens to a specified address if the string is unique.
     * @dev Only the owner (admin) can call this function.
     * @param to The address to receive the tokens.
     * @param amount The amount of tokens to be sent.
     * @param treasure A unique treasure that can only be claimed once.
     */
    function claimTreasure(address to, uint256 amount, string memory treasure) external onlyOwner {
        require(to != address(0), "Recipient address cannot be zero.");
        require(amount > 0, "Amount must be greater than zero.");
        require(!claimedTreasures[treasure], "This treasure has already been claimed.");

        // Mark the treasure as claimed
        claimedTreasures[treasure] = true;

        // Approve the tokens
        token.approve(address(this), amount);

        // Transfer the tokens
        token.safeTransfer(to, amount);

        // Emit an event
        emit TreasureClaimed(to, amount, treasure);
    }

    /**
     * @notice Checks if a treasure has been claimed.
     * @param treasure The treasure to check.
     * @return True if the treasure has been claimed, false otherwise.
     */
    function isTreasureClaimed(string memory treasure) external view returns (bool) {
        return claimedTreasures[treasure];
    }
}
