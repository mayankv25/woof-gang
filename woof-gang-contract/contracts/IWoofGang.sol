// SPDX-License-Identifier: MIT
// Creator: The Systango Team

pragma solidity ^0.8.2;

/**
 * @dev Interface of the Entrypass token implementation.
*/

interface IWoofGang {

    // The event emitted when new token is minted
    event newNFTCreated(uint tokenId);

    // The event emitted when nft will airdrop
    event NFTAirDrop(uint tokenId);

    /**
     * @dev Update the base uri
     */
    function updateBaseURI(string memory newBaseUri) external;

    /**
     * @dev Update the end time
     */
    function updateEndTime(uint256 newMintEndTime) external;
    
    /**
     * @dev Update the mint price
     */
    function updateMintPrice (uint256 newMintPrice) external;

    /**
     * @dev Withdraw the share amount to account owner
     */
    function withdraw(address payable account , uint256 amount) external;

    /**
     * @dev Mint a new token 
     */
    function mint(uint256 quantity) external payable;
    
    /**
     * @dev Airdrop the Tokens to assigned address by the owner
     */
    function airDrop(address[] memory account , uint256[] memory amount) external;

    /**
     * @dev Mint the remaining token which is left to mint
     */
    function mintRemainingToOwner(uint amount)external ; 
}