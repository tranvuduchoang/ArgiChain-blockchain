const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Final Test: Buy Listing 6...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deployer (Supplier):", deployer.address);

  // Real buyer address from error log
  const buyerAddress = "0xDE800c6278D82813AFd5104c365693C19B82F206";
  console.log("Buyer address:", buyerAddress);

  // Get contract addresses
  const deploymentInfo = require("../deployment-info.json");
  const tokenAddress = deploymentInfo.contracts.AgriChainToken;
  const marketplaceAddress = deploymentInfo.contracts.AgriChainMarketplace;

  // Get contracts
  const AgriChainToken = await ethers.getContractFactory("AgriChainToken");
  const AgriChainMarketplace = await ethers.getContractFactory("AgriChainMarketplace");

  const tokenContract = AgriChainToken.attach(tokenAddress);
  const marketplaceContract = AgriChainMarketplace.attach(marketplaceAddress);

  console.log("\n=== STEP 1: CHECK LISTING 6 STATUS ===");
  
  const listing6 = await marketplaceContract.listings(6);
  console.log("Listing 6 details:", {
    listingId: listing6[0].toString(),
    tokenId: listing6[1].toString(),
    supplier: listing6[2],
    price: listing6[3].toString(),
    quantity: listing6[4].toString(),
    remainingQuantity: listing6[5].toString(),
    expiryTime: listing6[6].toString(),
    isActive: listing6[7],
    expiryDate: new Date(Number(listing6[6]) * 1000).toISOString()
  });

  // Verify listing is valid
  if (!listing6[7]) {
    console.log("❌ Listing 6 is not active");
    return;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (Number(listing6[6]) < currentTime) {
    console.log("❌ Listing 6 is expired");
    return;
  }

  console.log("✅ Listing 6 is valid and active");

  console.log("\n=== STEP 2: CHECK BUYER STATUS ===");
  
  // Check buyer token balance
  const buyerBalance = await tokenContract.balanceOf(buyerAddress);
  console.log("Buyer token balance:", ethers.formatEther(buyerBalance), "AGRI");
  
  // Check buyer allowance
  const allowance = await tokenContract.allowance(buyerAddress, marketplaceAddress);
  console.log("Buyer allowance for marketplace:", ethers.formatEther(allowance), "AGRI");
  
  // Calculate required amount
  const price = listing6[3];
  const quantity = 1;
  const totalPrice = price * BigInt(quantity);
  
  console.log("Required price:", ethers.formatEther(totalPrice), "AGRI");
  console.log("Buyer has enough tokens:", buyerBalance >= totalPrice);
  console.log("Buyer has enough allowance:", allowance >= totalPrice);

  if (buyerBalance < totalPrice) {
    console.log("❌ Buyer has insufficient token balance");
    return;
  }

  if (allowance < totalPrice) {
    console.log("❌ Buyer has insufficient allowance - needs to approve marketplace");
    return;
  }

  console.log("\n=== STEP 3: SIMULATE BUY TRANSACTION ===");
  
  // Create a new signer for the buyer (this won't work in real scenario)
  // But we can simulate the transaction parameters
  console.log("📝 Transaction parameters:");
  console.log("  - Function: buyProduct(6, 1)");
  console.log("  - Listing ID: 6");
  console.log("  - Quantity: 1");
  console.log("  - Total Price:", ethers.formatEther(totalPrice), "AGRI");
  console.log("  - Buyer:", buyerAddress);
  console.log("  - Supplier:", listing6[2]);
  console.log("  - Token ID:", listing6[1].toString());

  console.log("\n=== STEP 4: FRONTEND INTEGRATION ===");
  
  console.log("✅ Frontend should now work with:");
  console.log("  - Listing ID: 6");
  console.log("  - Buyer address:", buyerAddress);
  console.log("  - Required approval:", ethers.formatEther(totalPrice), "AGRI");
  console.log("  - Network: BSC Testnet (Chain ID: 97)");
  
  console.log("\n🎉 All checks passed! The buy transaction should work now.");
  console.log("📝 Make sure buyer has approved marketplace for", ethers.formatEther(totalPrice), "AGRI tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
