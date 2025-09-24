const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging Authorization...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Get contract addresses from deployment info
  const deploymentInfo = require("../deployment-info.json");
  const tokenAddress = deploymentInfo.contracts.AgriChainToken;
  const marketplaceAddress = deploymentInfo.contracts.AgriChainMarketplace;

  console.log("Token address:", tokenAddress);
  console.log("Marketplace address:", marketplaceAddress);

  // Get token contract
  const AgriChainToken = await ethers.getContractFactory("AgriChainToken");
  const tokenContract = AgriChainToken.attach(tokenAddress);

  // Check owner
  const owner = await tokenContract.owner();
  console.log("Token contract owner:", owner);
  console.log("Is deployer the owner?", owner.toLowerCase() === deployer.address.toLowerCase());

  // Check current authorization status
  const isAuthorized = await tokenContract.authorizedMinters(marketplaceAddress);
  console.log("Current authorization status:", isAuthorized);

  // Check if we can call addAuthorizedMinter
  try {
    console.log("🔐 Attempting to authorize marketplace as minter...");
    const tx = await tokenContract.addAuthorizedMinter(marketplaceAddress);
    console.log("Transaction hash:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Check logs
    console.log("Transaction logs:", receipt.logs);

    // Verify authorization again
    const isNowAuthorized = await tokenContract.authorizedMinters(marketplaceAddress);
    console.log("New authorization status:", isNowAuthorized);

  } catch (error) {
    console.error("❌ Error authorizing:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
