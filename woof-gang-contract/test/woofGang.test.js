const {
    BN, // Big Number support
    constants, // Common constants, like the zero address and largest integers
    expectEvent, // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
    time,
} = require("@openzeppelin/test-helpers");

const { fromWei, toWei } = require("web3-utils");
const keccak256 = require("keccak256");
const WoofGang = artifacts.require("WoofGang");

contract("WoofGang", (accounts) => {

    const EventNames = {
        Paused: "Paused",
        Unpaused: "Unpaused",
        Transfer: "Transfer",
        NewNFTCreated: "newNFTCreated",
        NFTAirDrop: "NFTAirDrop",
        TransferSingle: "TransferSingle",
    };

    const [owner, user, bob, steve, blackListUser, george, nonWhiteListUser] = accounts;

    const name = "The WoofGang Gang";
    const symbol = "TWG";
    const baseURI1 = "https://ipfs.io/ipfs/QmT5LTjW2oenEF3tSDQreSGtMfwxTw6SQbf3tSER1BLx2Z/";
    const baseURI2 = "http://google.co.in/";
    const mintPrice = toWei("0.001", "ether");
    const newMintPrice = toWei("0.1", "ether");
    const incorrectWithdrawBalance = toWei("1", "ether");
    const nullBytes = "0x";
    let total = 0;
    let tokenId = 0;
    let MintAmount = 5;
    let mintEndTime = Math.floor((new Date() / 1000) + 1000);
    let newMintEndTime = Math.floor((new Date() / 1000));
    let woofGangInstance = null;

    async function initContract() {
        woofGangInstance = await WoofGang.new(name, symbol, baseURI2, mintEndTime, mintPrice, { from: owner });
    }

    before("Deploy new Woof Gang Token Contract", async () => {
        await initContract();
    });

    describe("Initial State", () => {
        describe("when the woof gang contract is instantiated", function () {
            it("has a name", async function () {
                expect(await woofGangInstance.name()).to.equal(name);
            });

            it("has a symbol", async function () {
                expect(await woofGangInstance.symbol()).to.equal(symbol);
            });

            it("should create a new  contract address", async () => {
                expect(woofGangInstance.address);
            });

        });
    });

    describe("updateBaseURI", async () => {
        describe("when other user tries to update the base uri", async () => {
            it("should not upadte the base uri", async () => {
                await expectRevert(
                    woofGangInstance.updateBaseURI(baseURI2, {
                        from: user,
                    }),
                    "Ownable: caller is not the owner"
                );
            })
        });

        describe("when owner tries to update the base uri", async () => {

            it("should not update base uri if new uri is same as previous uri", async () => {
                await expectRevert(
                    woofGangInstance.updateBaseURI(baseURI2, {
                        from: owner,
                    }),
                    "WoofGang: Current state is already what you have selected."
                );
            });

            it("should update the base uri", async () => {
                await woofGangInstance.updateBaseURI(baseURI1, { from: owner });
                expect(await woofGangInstance.baseUri()).to.equal(baseURI1);
            });
        });

    });

    describe("uri", async () => {
        describe("when users tries to get the uri", async () => {
            it("should get the base uri", async () => {
                expect(await woofGangInstance.uri(tokenId)).to.equal(baseURI1 + "0.json");
            });
        })
    });

    describe("updateMintPrice", async () => {
        describe("when other user tries to update the mint price", async () => {
            it("should not upadte the mint price", async () => {
                await expectRevert(
                    woofGangInstance.updateMintPrice(newMintPrice, {
                        from: user,
                    }),
                    "Ownable: caller is not the owner"
                );
            });
        });

        describe("when owner tries to update the mint price", async () => {
            it("should not update mint price if new mint price is same as old mint price", async () => {
                await expectRevert(
                    woofGangInstance.updateMintPrice(mintPrice, {
                        from: owner,
                    }),
                    "WoofGang: Current state is already what you have selected."
                );
            });
            it("should update the mint price", async () => {
                await woofGangInstance.updateMintPrice(newMintPrice, { from: owner });
                expect((await woofGangInstance.mintPrice()).toString()).to.equal(newMintPrice.toString());
            })
        })
    });

    describe("airDrop", async () => {
        describe("when other user tries to airDrop token", async () => {
            it("should not airDrop token", async () => {
                await expectRevert(
                    woofGangInstance.airDrop([george,bob],[1,3],{
                        from: user,
                    }),
                    "Ownable: caller is not the owner"
                );
            })

        });
        describe("when owner tries to airDrop token", async () => {
            it("should airDrop token", async () => {
                const airDropReciept = await woofGangInstance.airDrop([bob,george],[2,4],{
                    from: owner,
                });
                total = total + 6;
                expect((await woofGangInstance.totalSupply()).toString()).to.equal(total.toString());
            })
        })
    });

    describe("mint", async () => {
        it("should not mint token if insufficient eth supplied", async () => {
            await expectRevert(
                woofGangInstance.mint(MintAmount,{
                    from: user,
                    value: mintPrice*MintAmount
                }),
                "WoofGang: Insufficient ETH supplied"
            );
        })
        it("should not mint tokens is given amount is greater than remaining token", async () => {
                await expectRevert(
                    woofGangInstance.mint(998,{
                        from: owner,
                    }),
                    "WoofGang: Amount is more than remanining tokens"
                );
        })
        it("should mint new token", async () => {
            const mintReciept = await woofGangInstance.mint(MintAmount,{
                from: user,
                value: newMintPrice*MintAmount
            });
            total= total+MintAmount;
            expect((await woofGangInstance.totalSupply()).toString()).to.equal(total.toString());

        })
    });

    describe("mintRemainingToOwner", async ()=>{
        describe("when mint process is active", async () => {
            it("should not mint remaining tokens", async () => {
                await expectRevert(
                    woofGangInstance.mintRemainingToOwner(MintAmount,{
                        from: owner,
                    }),
                    "WoofGang: Mint process is in progress"
                );
            })

        });
    });

    describe("updateEndTime", async () => {
        describe("when other user tries to update the end time ", async () => {
            it("should not upadte the end time", async () => {
                await expectRevert(
                    woofGangInstance.updateEndTime(mintEndTime, {
                        from: user,
                    }),
                    "Ownable: caller is not the owner"
                );
            })
        });

        describe("when owner tries to update the mint end time", async () => {
            it("should not update mint end time if new end time is same as previous end time", async () => {
                await expectRevert(
                    woofGangInstance.updateEndTime(mintEndTime, {
                        from: owner,
                    }),
                    "WoofGang: Current state is already what you have selected."
                );
            })

            it("should update the mint end time", async () => {
                await woofGangInstance.updateEndTime(newMintEndTime, {
                    from: owner,
                })

                expect((await woofGangInstance.mintEndTime()).toString()).to.equal(newMintEndTime.toString());
            })

            it("should not update mint end time if mint process is already ended", async () => {
                await expectRevert(
                    woofGangInstance.updateEndTime(mintEndTime, {
                        from: owner,
                    }),
                    "WoofGang: Mint process is ended"
                );
            })

            it("should not mint token if process is ended",async ()=>{
                await expectRevert(
                    woofGangInstance.mint(MintAmount, {
                        from: owner,
                        value:newMintPrice
                    }),
                    "WoofGang: Mint process is ended"
                );
            })

        })
    });

    describe("mintRemainingToOwner", async ()=>{
        describe("when other user tries to mint remaining token", async () => {
            it("should not mint remaining tokens", async () => {
                await expectRevert(
                    woofGangInstance.mintRemainingToOwner(MintAmount,{
                        from: user,
                    }),
                    "Ownable: caller is not the owner"
                );
            })

        });
        describe("when owner  tries to mint remaining token", async () => {
            it("should not mint remaining tokens is given amount is greater than remaining token", async () => {
                await expectRevert(
                    woofGangInstance.mintRemainingToOwner(995,{
                        from: owner,
                    }),
                    "WoofGang: Amount is more than remanining tokens"
                );
            })

            it("should mint reaming tokens to owner", async () =>{
                await woofGangInstance.mintRemainingToOwner(MintAmount,{from: owner,});
                total= total+MintAmount;
                expect((await woofGangInstance.totalSupply()).toString()).to.equal(total.toString());
            })

        });
    });

    describe("withdraw", async () => {
        describe("when other user tries to withdraw ", async () => {
            it("should not withdraw contract balance", async () => {
                await expectRevert(
                    woofGangInstance.withdraw(bob, mintPrice, {
                        from: user,
                    }),
                    "Ownable: caller is not the owner"
                );
            })
        });

        describe("when owner tries to withdraw ", async () => {
            it("should not withdraw if contract has insufficient balance", async () => {
                await expectRevert(
                    woofGangInstance.withdraw(bob, incorrectWithdrawBalance, {
                        from: owner,
                    }),
                    "WoofGang: insufficient ether in contract"
                );
            })

            it("should not withdraw to zero address", async () => {
                await expectRevert(
                    woofGangInstance.withdraw(constants.ZERO_ADDRESS, mintPrice, {
                        from: owner,
                    }),
                    "WoofGang: Cannot withdraw to Zero Address"
                );
            })

            it("should withdraw balance", async () => {
                let beforeWithdrawBobBalance = fromWei(
                    await web3.eth.getBalance(bob),
                    "ether"
                );

                await woofGangInstance.withdraw(bob, mintPrice, { from: owner });
                let afterWithdrawBobBalance = fromWei(
                    await web3.eth.getBalance(bob),
                    "ether"
                );
                assert.isAtMost(
                    parseInt(beforeWithdrawBobBalance),
                    parseInt(afterWithdrawBobBalance),
                    "error in wihdraw"
                );

            })
        })
    });

    describe("balanceOfContract", async () => {
        describe("when user tries to get balance of the contract", async () => {
            it("should get balance of contract", async () => {
                let contractBalance = fromWei(
                    await web3.eth.getBalance(await woofGangInstance.address),
                    "ether"
                );
                expect(contractBalance).to.equal(fromWei(
                    await woofGangInstance.balanceOfContract(),
                    "ether"
                ));
            })
        })
    });

    describe("pause", () => {
        describe("when other user tries to pause contract", function () {
            it("should not pause contract", async () => {
                expect(await woofGangInstance.paused()).to.equal(false);
                await expectRevert(
                    woofGangInstance.pause({
                        from: user,
                    }),
                    "Ownable: caller is not the owner"
                );
            });
        });

        describe("when owner tries to pause contract", function () {
            it("should pause contract", async () => {
                expect(await woofGangInstance.paused()).to.equal(false);
                const pauseReceipt = await woofGangInstance.pause({
                    from: owner,
                });
                await expectEvent(pauseReceipt, EventNames.Paused, {
                    account: owner,
                });
                expect(await woofGangInstance.paused()).to.equal(true);
            });
        });

        describe("When contract is pause", async () => {
            it("should not withdraw balance", async function () {
                expect(await woofGangInstance.paused()).to.equal(true);
                await expectRevert(
                    woofGangInstance.withdraw(bob, mintPrice, {
                        from: owner,
                    }),
                    "Pausable: paused"
                );
            });
            it("should not update mint price", async function () {
                expect(await woofGangInstance.paused()).to.equal(true);
                await expectRevert(
                    woofGangInstance.updateMintPrice(newMintPrice, {
                        from: owner,
                    }),
                    "Pausable: paused"
                );
            });
            it("should not update  baseUri ", async function () {
                expect(await woofGangInstance.paused()).to.equal(true);
                await expectRevert(
                    woofGangInstance.updateBaseURI(baseURI1, {
                        from: owner,
                    }),
                    "Pausable: paused"
                );
            });

            it("should not update mint end time  ", async function () {
                expect(await woofGangInstance.paused()).to.equal(true);
                await expectRevert(
                    woofGangInstance.updateEndTime(newMintEndTime, {
                        from: owner,
                    }),
                    "Pausable: paused"
                );
            });

            it("should not mint token ", async function () {
                expect(await woofGangInstance.paused()).to.equal(true);
                await expectRevert(
                    woofGangInstance.mint(MintAmount,{
                        from: owner,
                    }),
                    "Pausable: paused"
                );
            });

            it("should not airDrop token ", async function () {
                expect(await woofGangInstance.paused()).to.equal(true);
                await expectRevert(
                    woofGangInstance.airDrop([bob],[2], {
                        from: owner,
                    }),
                    "Pausable: paused"
                );
            });

        });
    });

    describe("unpause", () => {
        describe("when other user tries to unpause contract", function () {
            it("should not unpause contract", async () => {
                expect(await woofGangInstance.paused()).to.equal(true);
                await expectRevert(
                    woofGangInstance.unpause({
                        from: user,
                    }),
                    "Ownable: caller is not the owner"
                );
            });
        });

        describe("when owner tries to unpause contract", function () {
            it("should unpause contract", async () => {
                expect(await woofGangInstance.paused()).to.equal(true);
                const unpauseReceipt = await woofGangInstance.unpause({
                    from: owner,
                });
                await expectEvent(unpauseReceipt, EventNames.Unpaused, {
                    account: owner,
                });
                expect(await woofGangInstance.paused()).to.equal(false);
            });
        });
    });

});