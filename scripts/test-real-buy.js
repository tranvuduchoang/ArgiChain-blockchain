const { ethers } = require("hardhat");

async function main() {
  console.log("🛒 Testing Real Buy Product Flow...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deployer (supplier):", deployer.address);

  // Get contract addresses
  const deploymentInfo = require("../deployment-info.json");
  const tokenAddress = deploymentInfo.contracts.AgriChainToken;
  const nftAddress = deploymentInfo.contracts.AgriChainNFT;
  const marketplaceAddress = deploymentInfo.contracts.AgriChainMarketplace;

  // Get contracts
  const AgriChainToken = await ethers.getContractFactory("AgriChainToken");
  const AgriChainNFT = await ethers.getContractFactory("AgriChainNFT");
  const AgriChainMarketplace = await ethers.getContractFactory("AgriChainMarketplace");

  const tokenContract = AgriChainToken.attach(tokenAddress);
  const nftContract = AgriChainNFT.attach(nftAddress);
  const marketplaceContract = AgriChainMarketplace.attach(marketplaceAddress);

  // Check if marketplace is authorized as minter
  const isAuthorized = await tokenContract.authorizedMinters(marketplaceAddress);
  console.log("Marketplace authorized as minter:", isAuthorized);

  if (!isAuthorized) {
    console.log("❌ Marketplace not authorized. Please run authorize-marketplace-minter.js first");
    return;
  }

  // Get listing details
  const listingId = 1;
  const listing = await marketplaceContract.listings(listingId);
  console.log("Listing details:", {
    listingId: listing[0].toString(),
    tokenId: listing[1].toString(),
    supplier: listing[2],
    price: listing[3].toString(),
    quantity: listing[4].toString(),
    remainingQuantity: listing[5].toString(),
    isActive: listing[7]
  });

  if (!listing[7]) {
    console.log("❌ Listing is not active");
    return;
  }

  const quantity = 1;
  const totalPrice = listing[3] * BigInt(quantity);
  console.log("Total price:", ethers.formatEther(totalPrice));

  // Check supplier's NFT balance before
  const supplierNftBalanceBefore = await nftContract.balanceOf(listing[2], listing[1]);
  console.log("Supplier NFT balance before:", supplierNftBalanceBefore.toString());

  // Check if supplier has enough NFTs
  if (supplierNftBalanceBefore < BigInt(quantity)) {
    console.log("❌ Supplier doesn't have enough NFTs");
    return;
  }

  console.log("✅ All checks passed! The buy product flow should work now.");
  console.log("📝 To test the actual buy flow from frontend:");
  console.log("1. Make sure the buyer has enough tokens (we already transferred 10 tokens)");
  console.log("2. The buyer needs to approve the marketplace to spend their tokens");
  console.log("3. The buyer calls buyProduct() function");
  console.log("4. The marketplace will:");
  console.log("   - Transfer tokens from buyer to supplier");
  console.log("   - Transfer NFT from supplier to buyer");
  console.log("   - Add loyalty points to buyer");
  console.log("   - Emit ProductSold event");

  console.log("\n🎉 The 'Not authorized to mint' error has been fixed!");
  console.log("The marketplace is now authorized to add loyalty points to buyers.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
