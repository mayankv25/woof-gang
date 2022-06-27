const WoofGang = artifacts.require("WoofGang");
const NAME = process.env.NAME;
const SYMBOL = process.env.SYMBOL;
const URI = process.env.BASEURI;
const mintEndTime = process.env.MINTENDTIME;
const mintPrice = process.env.MINTPRICE;

module.exports = async function (deployer) {
  const instance = await deployer.deploy(WoofGang, NAME, SYMBOL, URI, mintEndTime, mintPrice );
  console.log(instance);
};
