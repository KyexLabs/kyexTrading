import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

import { KyexZetaTrading, KyexZetaTrading__factory } from "../typechain-types";

describe("KyexTrading", () => {
  let kyexContract: KyexZetaTrading;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;

  beforeEach(async () => {
    [deployer, ...accounts] = await ethers.getSigners();

    await network.provider.send("hardhat_setBalance", [deployer.address, parseUnits("1000000").toHexString()]);

    const KyexFactory = (await ethers.getContractFactory("KyexZetaTrading")) as KyexZetaTrading__factory;
    kyexContract = (await KyexFactory.deploy(deployer.address)) as KyexZetaTrading;
    await kyexContract.deployed();
  });

  describe("Initialize", () => {
    it("Contract Owner Check", async () => {
      let owner = await kyexContract.owner();
      expect(owner).to.be.eq(deployer.address);

      owner = await kyexContract.owner();
      expect(owner).to.be.eq(deployer.address);
    });
  });

  describe("Validations", function () {
    it("Deployer Set Main Address", async function () {

      await kyexContract.connect(deployer).setMainAddress("0x000000000000000000000000000000000000dEaD");

      expect( await kyexContract.mainAddress()).to.be.eq('0x000000000000000000000000000000000000dEaD');
    });

    it("Non-Deployer Set Main Address", async function () {
      let external = await accounts[1];
      // kyexContract.connect(owner).owner();

      // To set NEW mainAddress (fail)
      await expect(kyexContract.connect(external).setMainAddress
      ("0x0000000000000000000000000000000000001111")).to.be.reverted;

      // Still remain the same mainAddress
      expect( await kyexContract.mainAddress()).to.be.eq('0x000000000000000000000000000000000000dEaD');

    });

  });


});
