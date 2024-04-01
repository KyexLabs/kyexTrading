import { parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getNonZetaAddress } from "@zetachain/protocol-contracts";
import { expect } from "chai";
import { ethers } from "hardhat";
import { evmSetup } from "./test.helpers";

import { KyexZetaTrading, KyexZetaTrading__factory, MockSystemContract, MockZRC20 } from "../typechain-types";

describe("KyexTrading", () => {
  let kyexContract: KyexZetaTrading;
  let ZRC20Contracts: MockZRC20[];
  let systemContract: MockSystemContract;

  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;

  beforeEach(async () => {
    [deployer, ...accounts] = await ethers.getSigners();

  });

  describe("Initialize", () => {
    it("Create ZRC20 & Deploy", async () => {

      // await network.provider.send("hardhat_setBalance", [deployer.address, parseUnits("1000000").toHexString()]);

      const uniswapRouterAddr = getNonZetaAddress("uniswapV2Router02", "eth_mainnet");
  
      const uniswapFactoryAddr = getNonZetaAddress("uniswapV2Factory", "eth_mainnet");
  
      const wGasToken = getNonZetaAddress("weth9", "eth_mainnet");
  
      const evmSetupResult = await evmSetup(wGasToken, uniswapFactoryAddr, uniswapRouterAddr);
      ZRC20Contracts = evmSetupResult.ZRC20Contracts;
      systemContract = evmSetupResult.systemContract;
  
      // const amount = parseUnits("10");
      // await ZRC20Contracts[0].transfer(deployer.address, amount);
  
      const KyexFactory = (await ethers.getContractFactory("KyexZetaTrading")) as KyexZetaTrading__factory;
      kyexContract = (await KyexFactory.deploy(deployer.address)) as KyexZetaTrading;
      await kyexContract.deployed();
    });

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

      expect( await kyexContract.mainAddress()).to.be.eq("0x000000000000000000000000000000000000dEaD");
    });

    it("Non-Deployer Set Main Address", async function () {
      let external = await accounts[1];
      // kyexContract.connect(owner).owner();

      // To set NEW mainAddress (fail)
      await expect(kyexContract.connect(external).setMainAddress
      ("0x0000000000000000000000000000000000001111")).to.be.reverted;

      // Still remain the same mainAddress
      expect( await kyexContract.mainAddress()).to.be.eq("0x000000000000000000000000000000000000dEaD");

    });

    it("Deployer Set Pool Address", async function () {

      await kyexContract.connect(deployer).setPooledAddress(kyexContract.address);

      expect( await kyexContract.pooledAddress()).to.be.eq(kyexContract.address);
    });

    it("Non-Deployer Set Pool Address", async function () {
      let external = await accounts[1];

      // To set NEW pooledAddress (fail)
      await expect(kyexContract.connect(external).setPooledAddress
      ("0x0000000000000000000000000000000000001111")).to.be.reverted;

      // Still remain the same pooledAddress
      expect( await kyexContract.pooledAddress()).to.be.eq(kyexContract.address);

    });

  });

  describe("Transaction", function () {
    const amount = parseUnits("10");

    it("Send TX", async function () {
      //console.log((await ZRC20Contracts[0].balanceOf(deployer.address)).toBigInt());

      // Approve kyexContract Spending
      await ZRC20Contracts[0].connect(deployer).approve(kyexContract.address, amount);

      // Expect allowance = amount 
      expect( (await ZRC20Contracts[0].allowance(deployer.address, kyexContract.address))).to.be.eq(amount);

      // Send transactions
      const txHash = await kyexContract.connect(deployer).transaction(ZRC20Contracts[0].address, amount, 'First Order');

    });

    // First Order userAddress Check
    it("First Order. userAddress", async function () {
      expect ( await ((await kyexContract.orderInfos(1n)).userAddress)).to.be.eq(deployer.address);
    });

    // First Order tokenAddress Check
    it("First Order. tokenAddress", async function () {
      expect ( await ((await kyexContract.orderInfos(1n)).tokenAddress)).to.be.eq(ZRC20Contracts[0].address);
    });

    // First Order amount Check
    it("First Order. amount", async function () {
      expect ( await ((await kyexContract.orderInfos(1n)).amount)).to.be.eq(amount);
    });

    // First Order remarks Check
    it("First Order. remarks", async function () {
      expect ( await ((await kyexContract.orderInfos(1n)).remarks)).to.be.eq("First Order");
    });

  });

  describe("Withdrawal Manage", function () {
    const amount = parseUnits("10");

    it("withdraw", async function () {
      let external = await accounts[1];

      // External Wallet's balance should be zero.
      expect (await ZRC20Contracts[0].balanceOf(external.address)).to.be.eq(parseUnits('0'));
      
      // Withdraw fund into External 
      await kyexContract.connect(deployer).withdrawalManage(external.address, ZRC20Contracts[0].address, amount);
  
      // External Wallet should now received the fund
      expect (await ZRC20Contracts[0].balanceOf(external.address)).to.be.eq(parseUnits('10'))

    });
  });

  describe("Ownership", function () {

    it("Transfer Ownership", async function () {
      let external = await accounts[1];

      await kyexContract.connect(deployer).transferOwnership(external.address);

      expect ( await kyexContract.owner() ).to.be.eq(external.address);
    });
  });



});