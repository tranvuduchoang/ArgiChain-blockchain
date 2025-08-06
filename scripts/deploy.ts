import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting AgriChain contracts deployment...");

  // Get the deployer account
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("❌ No signers available. Please set PRIVATE_KEY in .env file");
  }
  
  const [deployer] = signers;
  if (!deployer) {
    throw new Error("❌ Deployer account not found. Please check your PRIVATE_KEY in .env file");
  }
  
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  // Check if account has sufficient balance
  if (balance === 0n) {
    throw new Error("❌ Insufficient balance. Please add some ETH to your account for gas fees");
  }

  // Deploy AgriChainToken
  console.log("\n📦 Deploying AgriChainToken...");
  const AgriChainToken = await ethers.getContractFactory("AgriChainToken");
  const agriToken = await AgriChainToken.deploy();
  await agriToken.waitForDeployment();
  console.log("✅ AgriChainToken deployed to:", await agriToken.getAddress());

  // Deploy AgriChainNFT
  console.log("\n📦 Deploying AgriChainNFT...");
  const baseURI = "https://agrichain.com/api/nft/";
  const contractURI = "https://agrichain.com/api/contract-metadata";
  
  const AgriChainNFT = await ethers.getContractFactory("AgriChainNFT");
  const agriNFT = await AgriChainNFT.deploy(baseURI, contractURI);
  await agriNFT.waitForDeployment();
  console.log("✅ AgriChainNFT deployed to:", await agriNFT.getAddress());

  // Deploy AgriChainMarketplace
  console.log("\n📦 Deploying AgriChainMarketplace...");
  const AgriChainMarketplace = await ethers.getContractFactory("AgriChainMarketplace");
  const marketplace = await AgriChainMarketplace.deploy(await agriToken.getAddress(), await agriNFT.getAddress());
  await marketplace.waitForDeployment();
  console.log("✅ AgriChainMarketplace deployed to:", await marketplace.getAddress());

  // Set up initial configurations
  console.log("\n⚙️ Setting up initial configurations...");

  // Authorize marketplace to mint tokens
  console.log("🔐 Authorizing marketplace to mint tokens...");
  await agriToken.addAuthorizedMinter(await marketplace.getAddress());
  console.log("✅ Marketplace authorized to mint tokens");

  // Authorize marketplace to add loyalty points
  console.log("🔐 Authorizing marketplace to add loyalty points...");
  await agriToken.addAuthorizedMinter(await marketplace.getAddress());
  console.log("✅ Marketplace authorized to add loyalty points");

  // Authorize deployer as supplier for testing
  console.log("🔐 Authorizing deployer as supplier...");
  await agriNFT.authorizeSupplier(deployer.address);
  console.log("✅ Deployer authorized as supplier");

  // Transfer some tokens to marketplace for initial liquidity
  console.log("💰 Transferring initial tokens to marketplace...");
  const initialLiquidity = ethers.parseEther("10000"); // 10,000 AGRI tokens
  await agriToken.transfer(await marketplace.getAddress(), initialLiquidity);
  console.log("✅ Initial liquidity transferred to marketplace");

  // Print deployment summary
  console.log("\n🎉 Deployment completed successfully!");
  console.log("=" .repeat(50));
  console.log("📋 Contract Addresses:");
  console.log("AgriChainToken:", await agriToken.getAddress());
  console.log("AgriChainNFT:", await agriNFT.getAddress());
  console.log("AgriChainMarketplace:", await marketplace.getAddress());
  console.log("=" .repeat(50));
  console.log("🔗 Network:", (await ethers.provider.getNetwork()).name);
  console.log("📊 Deployer:", deployer.address);
  console.log("=" .repeat(50));

  // Save deployment info to file
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    contracts: {
      AgriChainToken: await agriToken.getAddress(),
      AgriChainNFT: await agriNFT.getAddress(),
      AgriChainMarketplace: await marketplace.getAddress(),
    },
    deploymentTime: new Date().toISOString(),
  };

  console.log("\n💾 Deployment info saved to deployment-info.json");
  
  // Verify contracts on block explorer (if not on local network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 1337n) { // Not local network
    console.log("\n🔍 Waiting for block confirmations before verification...");
    await agriToken.deploymentTransaction()?.wait(6);
    await agriNFT.deploymentTransaction()?.wait(6);
    await marketplace.deploymentTransaction()?.wait(6);
    
    console.log("✅ Contracts deployed and confirmed!");
    console.log("🔍 You can now verify contracts on block explorer:");
    console.log(`AgriChainToken: ${await agriToken.getAddress()}`);
    console.log(`AgriChainNFT: ${await agriNFT.getAddress()}`);
    console.log(`AgriChainMarketplace: ${await marketplace.getAddress()}`);
  }
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 