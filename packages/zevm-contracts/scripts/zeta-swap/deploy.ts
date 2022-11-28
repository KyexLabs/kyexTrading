import { getAddress } from "@zetachain/addresses";
import { saveAddress } from "@zetachain/addresses-tools";
import { ethers } from "hardhat";

import { ZetaSwap, ZetaSwap__factory, ZetaSwapBtcInbound, ZetaSwapBtcInbound__factory } from "../../typechain-types";
import { SYSTEM_CONTRACT } from "../systemConstants";

const main = async () => {
  console.log(`Deploying ZetaSwap...`);

  const WZETA_ADDRESS = getAddress({
    address: "weth9",
    networkName: "athens",
    zetaNetwork: "athens"
  });

  const UNISWAP_ROUTER_ADDRESS = getAddress({
    address: "uniswapV2Router02",
    networkName: "athens",
    zetaNetwork: "athens"
  });

  const Factory = (await ethers.getContractFactory("ZetaSwap")) as ZetaSwap__factory;
  const contract = (await Factory.deploy(WZETA_ADDRESS, UNISWAP_ROUTER_ADDRESS)) as ZetaSwap;
  await contract.deployed();

  console.log("Deployed ZetaSwap. Address:", contract.address);
  saveAddress("zetaSwap", contract.address);

  const FactoryBTC = (await ethers.getContractFactory("ZetaSwapBtcInbound")) as ZetaSwapBtcInbound__factory;
  const contractBTC = (await FactoryBTC.deploy(
    WZETA_ADDRESS,
    UNISWAP_ROUTER_ADDRESS,
    SYSTEM_CONTRACT
  )) as ZetaSwapBtcInbound;
  await contractBTC.deployed();

  console.log("Deployed zetaSwapBtcInbound. Address:", contractBTC.address);
  saveAddress("zetaSwapBtcInbound", contractBTC.address);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
