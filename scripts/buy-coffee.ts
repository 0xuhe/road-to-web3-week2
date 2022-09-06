import {getUnnamedAccounts, ethers, deployments, getNamedAccounts} from 'hardhat';

import {setupUser, setupUsers} from '../test/utils';
import {BuyMeACoffee} from '../typechain';

const setup = async () => {
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

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  const tx = await p;
  try {
    await ethers.provider.send('evm_mine', []); // speed up on local network
  } catch (e) {}
  return tx.wait();
}

async function main() {
  const {users, BuyMeACoffee, deployer} = await setup();

  // Get the example accounts we'll be working with.
  const [tipper, tipper2, tipper3] = users;

  // We get the contract to deploy.

  // Check balances before the coffee purchase.
  const addresses = [deployer.address, tipper.address, BuyMeACoffee.address];
  console.log('== start ==');
  await printBalances(addresses);

  // Buy the owner a few coffees.
  const tip = {value: ethers.utils.parseEther('0.001')};
  await tipper.BuyMeACoffee.buyCoffee('Carolina', "You're the best!", tip);
  await tipper2.BuyMeACoffee.buyCoffee('Vitto', 'Amazing teacher', tip);
  await tipper3.BuyMeACoffee.buyCoffee('Kay', 'I love my Proof of Knowledge', tip);

  // Check balances after the coffee purchase.
  console.log('== bought coffee ==');
  await printBalances(addresses);

  // Withdraw.
  await deployer.BuyMeACoffee.withdrawTips();

  // Check balances after withdrawal.
  console.log('== withdrawTips ==');
  await printBalances(addresses);

  // Check out the memos.
  console.log('== memos ==');
  const memos = await BuyMeACoffee.getMemos();
  printMemos(memos);
}

// Returns the Ether balance of a given address.
async function getBalance(address: string) {
  const balanceBigInt = await ethers.provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses: string[]) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos: BuyMeACoffee.MemoStructOutput[]) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
