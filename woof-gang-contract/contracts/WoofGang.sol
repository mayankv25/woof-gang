// SPDX-License-Identifier: MIT
// Creator: The Systango Team
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./AbstractWoofGang.sol";

contract WoofGang is AbstractWoofGang {
    
    // Name of the token
    string public name;

    // Symbol of the token
    string public symbol;
    
    // Set the mint end time
    uint256 public mintEndTime;

    //Total supply which will increase after mint and airdrops
    uint256 public totalSupply;

    // Mint Price for token id 
    uint256 public mintPrice;

    //Base token Uri
    string public baseUri;

    // As token is an NFT so the minting amount will always be one
    uint8 constant NFT_AMOUNT = 1;

    // Maximum supply which we are using
    uint16 constant MAX_SUPPLY = 999;    

    // Zero Address
    address constant ZERO_ADDRESS = address(0);


    constructor(
        string memory nameOfContract, 
        string memory symbolOfContract,
        string memory uriOfContract,
        uint256 mintEndTimeOfContract,
        uint256 mintPriceOfContract
        
    ) ERC1155("") Random(MAX_SUPPLY) {
        name = nameOfContract;
        symbol = symbolOfContract;
        baseUri = uriOfContract;
        mintEndTime = mintEndTimeOfContract;
        mintPrice = mintPriceOfContract;
    }

    /// @dev This is the function to update the Base URI 
    /// @dev Only the owner can call this function
    /// @param newBaseUri New Base URI 

    function updateBaseURI(string memory newBaseUri) external override onlyOwner whenNotPaused 
    {
        require(keccak256(abi.encodePacked(baseUri)) != keccak256(abi.encodePacked(newBaseUri)) , "WoofGang: Current state is already what you have selected.");
        baseUri = newBaseUri;
    }

    /// @dev This is the function to update the mint nft end time
    /// @dev Only the owner can call this function
    /// @param newMintEndTime Adding updated Timing for Mint NFT 

    function updateEndTime(uint256 newMintEndTime) external override onlyOwner whenNotPaused 
    {
        require(keccak256(abi.encodePacked(mintEndTime)) != keccak256(abi.encodePacked(newMintEndTime)) , "WoofGang: Current state is already what you have selected.");
        require(block.timestamp <= mintEndTime , "WoofGang: Mint process is ended");
        mintEndTime = newMintEndTime;
    }

    /// @dev The public function for getting the URI string based on token id 
    /// @param id The id of the token whose URI should be get 

    function uri(uint id) public view virtual override(ERC1155)  returns (string memory) 
    {
        return string(abi.encodePacked(baseUri,Strings.toString(id),".json"));
    }

    /// @dev This is the function to update the nft price
    /// @dev Only the owner can call this function
    /// @param newMintPrice Adding updated NFT Price 

    function updateMintPrice (uint256 newMintPrice) external override onlyOwner whenNotPaused
    {
        require(keccak256(abi.encodePacked(mintPrice)) != keccak256(abi.encodePacked(newMintPrice)) , "WoofGang: Current state is already what you have selected.");
        mintPrice = newMintPrice;
    }

    /// @dev This is the function is used for the minting tokens
    /// @param quantity `quantity` is the number to mint

    function mint(uint256 quantity) external override payable whenNotPaused nonReentrant
    {
        require(MAX_SUPPLY >= totalSupply, "WoofGang: Maximum supply is exceed");
        require(block.timestamp <= mintEndTime , "WoofGang: Mint process is ended");
        require(quantity <= MAX_SUPPLY-totalSupply , "WoofGang: Amount is more than remanining tokens");
        require(msg.value >= (mintPrice)*quantity, "WoofGang: Insufficient ETH supplied");
        uint256 _totalSupply = totalSupply;
        for(uint16 i=0; i < quantity; i++){
            uint256 tokenId = _getRandomNFTTokenID();
            _totalSupply++;
            _mint(msg.sender, tokenId, NFT_AMOUNT, "");            
            emit newNFTCreated(tokenId);
        }
        totalSupply = _totalSupply;
    }

    /// @dev This function is used for the airdrop tokens to the given account and amount of tokens.
    /// @dev Only the owner can call this function
    /// @param account we need to put account address where owner wants to make Airdrop

    function airDrop(address[] calldata account , uint256[] calldata quantity) external override onlyOwner whenNotPaused {
        require(account.length == quantity.length, "WoofGang: Incorrect parameter length");
        uint256 _totalSupply = totalSupply;
        for(uint16 i=0; i<account.length; i++){
            require(quantity[i] <= MAX_SUPPLY-totalSupply , "WoofGang: Amount is more than remanining tokens");
            for(uint16 j=0; j<quantity[i];j++){
                require(MAX_SUPPLY >= totalSupply, "WoofGang: Maximum supply is exceed");
                uint256 tokenId = _getRandomNFTTokenID();
                _totalSupply++;
                _mint(account[i], tokenId, NFT_AMOUNT, "");                
                emit NFTAirDrop(tokenId);
            } 
        }
        totalSupply = _totalSupply;
    }


    /// @dev This function is used for airdrop the tokens to owner which is not minted
    /// @dev Only the owner can call this function
    /// @param batchSize `batchSize` is used to send the number of token ids. 

    function mintRemainingToOwner(uint256 batchSize) external override onlyOwner whenNotPaused 
    {
        require(block.timestamp >= mintEndTime , "WoofGang: Mint process is in progress");
        require(MAX_SUPPLY >= totalSupply, "WoofGang: Maximum supply is exceed");
        require(batchSize <= MAX_SUPPLY-totalSupply , "WoofGang: Amount is more than remanining tokens");
        uint256 _totalSupply = totalSupply;
        for(uint i = 0; i < batchSize; i++) {
            uint256 tokenId = _getNextRemainingTokenID();
            _totalSupply++;
            _mint(msg.sender, tokenId ,NFT_AMOUNT, "");            
            emit NFTAirDrop(tokenId);
        }
        totalSupply = _totalSupply;
    }

    /// @dev The external function for withdraw the amount of share hold by the account 
    /// @param account The account address in which the ether to be send
    /// @param amount `amount` is used to send the number of token ids.

    function withdraw(address payable account , uint256 amount) external override onlyOwner whenNotPaused nonReentrant 
    {
        require(account != ZERO_ADDRESS, "WoofGang: Cannot withdraw to Zero Address");
        require(address(this).balance > amount,"WoofGang: insufficient ether in contract");
        payable(account).transfer(amount);
    }

    /// @dev The external function is used to check the balance of contract

    function balanceOfContract() external view returns(uint256) 
    {
       return address(this).balance;
    }

    /// @dev Overridden function called before every token transfer

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        whenNotPaused
        override(ERC1155)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
