import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from 'hardhat';
import {BuyMeACoffee} from '../typechain';
import {setupUsers} from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('BuyMeACoffee');
  const contracts = {
    BuyMeACoffee: <BuyMeACoffee>await ethers.getContract('BuyMeACoffee'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
  };
});
describe('BuyMeACoffee', function () {
  it('test function', async function () {
    const {users, BuyMeACoffee} = await setup();
    // await expect(users[0].MyContract.fooFunc('foo')).to.emit(MyContract, 'MessageChanged').withArgs(users[0].address, 'foo');
  });
});
