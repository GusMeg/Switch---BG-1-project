import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";


/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

/* await deploy("AppWallet", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const appWallet = await hre.ethers.getContract<Contract>("AppWallet",deployer);
  const _addressAppWallet = await appWallet.getAddress();
*/
  await deploy("GetFunction",{
    from: deployer,
    args: [1995],
    log: true,
    autoMine: true,
  });

  const getFunction = await hre.ethers.getContract<Contract>("GetFunction", deployer);
  const gFaddress = await getFunction.getAddress();

  await deploy("FundManager", {
    from: deployer,
    // Contract constructor arguments
    args: [gFaddress],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  await deploy("Testing", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });
  const fundManager = await hre.ethers.getContract<Contract>("FundManager", deployer);
  //await fundManager.transferOwnership('0xf5df3bC7Ed9A94C6d27904AEB55aaE3b31fD7AC9');
/*const _addressFundManager = await fundManager.getAddress();
  await appWallet.transferOwnership(_addressFundManager);
*/
  //const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
  //console.log("👋 Initial greeting:", await yourContract.greeting());
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
