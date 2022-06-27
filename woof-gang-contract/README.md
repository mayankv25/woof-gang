# The Woof Gang ERC1155 Contract
Contract for minting tokens, airdrop, update URI, and mint remaining token to owner.


## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

## Table of Contents ##
1. [Setup](#Setup)
2. [Commands](#Commands)
3. [Contract Compile](#Contract-Compile)
4. [Truffle Config file](#Truffle-Config-File)
5. [Deploy On Local Network](#Deploy-On-Local-Network)
6. [Deploy On Testnet Network](#Deploy-On-Testnet-Network)
7. [Test Case Coverage](#Test-Case-Coverage)

## Setup

1. System Setup 

You'll need node, npm and the Truffle Suite to set up the development environment. 

- [Node](https://nodejs.org/en/)
    - Version - 16.13.0
- [Truffle Suite](https://www.trufflesuite.com/)
    - Version - 5.5.3

2. Wallet Setup

You will need a Blockchain wallet (Metamask) to deploy and test these smart contracts.

- To create a wallet on metamask install the Metamask extension on your web browser.
- Click on the Metamask extension and select Create a Wallet option from there.
- Setup a password for your Metamask login (Remember this is your Metamask login password not the account password).
- Tap to reveal the Secret Recovery Phrase and keep it safe with you.
- Confirm your Secret Recovery Phrase saved with you to add your account to Metamask.
- Now you can switch between Ethereum mainnet and other Test Networks.

3. EtherScan Setup

- You will require the Etherscan API KEY to verify and publish your smart contracts over the Ethererum public networks.
- To create an account on EtherScan go to [EtherScan](https://etherscan.io/register).
- Move to API-KEYs tab and click on Add button.
- Give the name to your API-KEY and it will be created.

Update the .env file from the .env.sample and place the values for the required fields.

- Update the Secret Recovery Phrase for MNEMONIC field.
- Update the EtherScan API KEY for ETHERSCANKEY field.
- Update the MintPrice for minting the tokens.
- Update the MintEndTime(Timestamp) when contract will stop.

4. .env Sample

```cmd
MNEMONIC=<Place your Ethereum address seed phrase here>
ETHERSCANKEY=<Place your Etherscan API key here>
NAME=<Place your Token Name here>
SYMBOL=<Place your Token Symbol here>
BASEURI=<Place your Token URI here>
MINTPRICE=<Add your mint price for one token>
MINTENDTIME=<Add your end mint time>
```

## Commands

  ```console
  npm install
  ``` 
    
  installs dependencies
    
  Dependencies List
  - @openzeppelin/test-helpers
  - @openzeppelin/contracts-upgradeable
  - @truffle/hdwallet-provider
  - dotenv
  - solidity-coverage
  - truffle
  - truffle-plugin-verify

  ## Contract Compile

  ```console
    truffle compile --all
  ```

  compile the contracts

  Contracts List
  - WoofGang.sol
  - Random.sol
  - Migrations.sol
  - AbstractWoofGang.sol
  - IWoofGang.sol

## Truffle Config File

This file would use your Mnemonic key and EtherScan API KEY to deploy the smart contracts on local network as well Ethereum and Test Network. 
These values will be picked up either from .env file explained above or the environment variables of the host system.

```js
require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = process.env.MNEMONIC;
const INFURA = process.env.INFURA;
const KEY = process.env.ETHERSCANKEY;

module.exports = {
  networks: {

    test: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
    },

    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `wss://ropsten.infura.io/ws/v3/${INFURA}`),
      network_id: 3,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `wss://rinkeby.infura.io/ws/v3/${INFURA}`),
      network_id: 4,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    kovan: {
      provider: () => new HDWalletProvider(mnemonic, `wss://kovan.infura.io/ws/v3/${INFURA}`),
      network_id: 42,
      timeoutBlocks: 200,
      skipDryRun: true
    }
    
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.2",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1500
        }
      }
    }
  },

  mocha: {
    enableTimeouts: false,
    before_timeout: 300000
  },

  plugins: [
    "solidity-coverage",
    "truffle-plugin-verify"
  ],

  api_keys: {
    etherscan: KEY
  }
};

```

## Deploy On Local Network

Network Name - test

- To run smart contract on test first start

    `ganache-cli -d`

    in another terminal

- To migrate the contracts 

    `truffle migrate --reset --network test`

    - This will use the migrations/2_deploy_woofgang.js file and deploy the Woof Gang contract.

        This file would use your NAME, SYMBOL, URI, MINTPRICE, and MINTENDTIME fields from .env file and pass to the smart contract.

- To test the contracts 

    `truffle test --network test`

    - This will use the test/woofGang.test.js file and test the Woof Gang contract.

## Deploy On Testnet Network

Network Name - testnet

- To migrate the contracts 

    `truffle migrate --network testnet`

    - This will use the migrations/2_deploy_woofgang.js file and deploy the MersMeta contract.

        This file would use your NAME, SYMBOL, URI, MINTPRICE, and MINTENDTIME fields from .env file and pass to the smart contract.

## Deploy On rinkeby Network 

Network Name - rinkeby

- To migrate the contracts 

    `truffle migrate --reset --network rinkeby`

    - This will use the migrations/2_deploy_woofgang.js file and deploy the MersMeta contract.

        This file would use your NAME, SYMBOL, URI, MINTPRICE, and MINTENDTIME fields from .env file and pass to the smart contract.
        Make sure you enter the correct addresses you which to give the respective roles.
        Before deploying the contract to Mainnet make sure you have tested everything on local and corrected, as deployment on Mainnet will involve real coins and gas fees.

## Test Case Coverage

To run the unit test case coverage on the smart contract we have used solidity-coverage npm package. The command to run the test coverage is:

- `truffle run coverage` 


-----------------------|----------|----------|----------|----------|----------------|
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------|----------|----------|----------|----------|----------------|
 contracts/            |      100 |    85.29 |      100 |      100 |                |
  AbstractWoofGang.sol |      100 |      100 |      100 |      100 |                |
  IWoofGang.sol        |      100 |      100 |      100 |      100 |                |
  Random.sol           |      100 |      100 |      100 |      100 |                |
  WoofGang.sol         |      100 |    84.38 |      100 |      100 |                |
-----------------------|----------|----------|----------|----------|----------------|
All files              |      100 |    85.29 |      100 |      100 |                |
-----------------------|----------|----------|----------|----------|----------------|
