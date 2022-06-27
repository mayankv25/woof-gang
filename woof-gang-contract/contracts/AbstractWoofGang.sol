// SPDX-License-Identifier: MIT
// Creator: The Systango Team

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IWoofGang.sol";
import "./Random.sol";

abstract contract AbstractWoofGang is ERC1155, Ownable, Pausable, ReentrancyGuard, Random,IWoofGang {
    
    /// @dev This function would pause the contract
    /// @dev Only the owner can call this function

    function pause() external onlyOwner {
        _pause();
    }

    /// @dev This function would unpause the contract
    /// @dev Only the owner can call this function

    function unpause() external onlyOwner {
        _unpause();
    }
}