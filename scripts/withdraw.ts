// import { HardhatRuntimeEnvironment } from 'hardhat/types';
// scripts/withdraw.js

import {deployments, ethers, getNamedAccounts, getUnnamedAccounts} from 'hardhat';
import {setupUser, setupUsers} from '../test/utils';
import {BuyMeACoffee} from '../typechain';
// import abi from '../artifacts/src/BuyMeACoffee.sol/BuyMeACoffee.json';

async function getBalance(address: string) {
  // const balanceBigInt = await provider.getBalance(address);
  const balanceBigInt = await ethers.provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

const setup = async () => {
  // await deployments.fixture('BuyMeACoffee');
  const contracts = {
    BuyMeACoffee: <BuyMeACoffee>await ethers.getContract('BuyMeACoffee'),
  };

  const users = await setupUsers(await getUnnamedAccounts(), contracts);

  const deployer = await setupUser((await getNamedAccounts()).deployer, contracts);

  return {
    ...contracts,
    users,
    deployer,
  };
};

async function main() {
  const {BuyMeACoffee, deployer} = await setup();

  console.log('current balance of owner: ', await getBalance(deployer.address), 'ETH');
  const contractBalance = await getBalance(BuyMeACoffee.address);
  console.log('current balance of contract: ', contractBalance, 'ETH');

  // Withdraw funds if there are funds to withdraw.
  if (contractBalance !== '0.0') {
    console.log('withdrawing funds..');
    const withdrawTxn = await BuyMeACoffee.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log('no funds to withdraw!');
  }

  // Check ending balance.
  console.log('current balance of owner: ', await getBalance(deployer.address), 'ETH');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
