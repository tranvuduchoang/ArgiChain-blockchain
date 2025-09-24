import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the balance of the deployer
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy AgriChainToken
  console.log("\n📦 Deploying AgriChainToken...");
  const AgriChainToken = await ethers.getContractFactory("AgriChainToken");
  const token = await AgriChainToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ AgriChainToken deployed to:", tokenAddress);

  // Deploy AgriChainNFT
  console.log("\n🎨 Deploying AgriChainNFT...");
  const AgriChainNFT = await ethers.getContractFactory("AgriChainNFT");
  const nft = await AgriChainNFT.deploy(
    "https://metadata.agrichain.com/nft/",
    "https://metadata.agrichain.com/contract.json"
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ AgriChainNFT deployed to:", nftAddress);

  // Deploy AgriChainMarketplace
  console.log("\n🏪 Deploying AgriChainMarketplace...");
  const AgriChainMarketplace = await ethers.getContractFactory("AgriChainMarketplace");
  const marketplace = await AgriChainMarketplace.deploy(
    tokenAddress,
    nftAddress
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ AgriChainMarketplace deployed to:", marketplaceAddress);

  // Authorize deployer as supplier
  console.log("\n🔐 Authorizing deployer as supplier...");
  await nft.authorizeSupplier(deployer.address);
  console.log("✅ Deployer authorized as supplier");

  // Save deployment info
  const deploymentInfo = {
    network: "bsctestnet",
    chainId: 97,
    deployer: deployer.address,
    contracts: {
      AgriChainToken: tokenAddress,
      AgriChainNFT: nftAddress,
      AgriChainMarketplace: marketplaceAddress
    },
    deployedAt: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📋 Deployment Summary:");
  console.log("=====================");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  console.log(`AgriChainToken: ${tokenAddress}`);
  console.log(`AgriChainNFT: ${nftAddress}`);
  console.log(`AgriChainMarketplace: ${marketplaceAddress}`);
  console.log(`Deployed at: ${deploymentInfo.deployedAt}`);

  console.log("\n🔧 Next steps:");
  console.log("1. Update .env files with the new contract addresses");
  console.log("2. Verify contracts on BSCScan");
  console.log("3. Test the minting functionality");

  // Update .env files
  console.log("\n📝 Updating .env files...");
  try {
    const { exec } = require('child_process');
    exec('npx hardhat run scripts/update-env.ts --network bsctestnet', (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log("❌ Error updating .env files:", error.message);
      } else {
        console.log("✅ .env files updated successfully");
      }
    });
  } catch (error) {
    console.log("❌ Error updating .env files:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });