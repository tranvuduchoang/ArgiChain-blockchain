const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Authorizing Marketplace as Token Minter...");

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

  // Check current authorization status
  const isAuthorized = await tokenContract.authorizedMinters(marketplaceAddress);
  console.log("Current authorization status:", isAuthorized);

  if (isAuthorized) {
    console.log("✅ Marketplace is already authorized as minter");
    return;
  }

  // Authorize marketplace as minter
  console.log("🔐 Authorizing marketplace as minter...");
  const tx = await tokenContract.addAuthorizedMinter(marketplaceAddress);
  console.log("Transaction hash:", tx.hash);

  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

  // Verify authorization
  const isNowAuthorized = await tokenContract.authorizedMinters(marketplaceAddress);
  console.log("New authorization status:", isNowAuthorized);

  if (isNowAuthorized) {
    console.log("🎉 Marketplace successfully authorized as minter!");
  } else {
    console.log("❌ Authorization failed");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
