const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging Listing Issue...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Get contract addresses
  const deploymentInfo = require("../deployment-info.json");
  const marketplaceAddress = deploymentInfo.contracts.AgriChainMarketplace;

  // Get marketplace contract
  const AgriChainMarketplace = await ethers.getContractFactory("AgriChainMarketplace");
  const marketplaceContract = AgriChainMarketplace.attach(marketplaceAddress);

  console.log("\n=== STEP 1: CHECK ALL LISTINGS ===");
  
  // Check listings from 1 to 10 (reasonable range)
  for (let i = 1; i <= 10; i++) {
    try {
      const listing = await marketplaceContract.listings(i);
      console.log(`\nListing ${i}:`, {
        listingId: listing[0].toString(),
        tokenId: listing[1].toString(),
        supplier: listing[2],
        price: listing[3].toString(),
        quantity: listing[4].toString(),
        remainingQuantity: listing[5].toString(),
        expiryTime: listing[6].toString(),
        isActive: listing[7],
        expiryDate: new Date(Number(listing[6]) * 1000).toISOString()
      });

      // Check if listing is expired
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = Number(listing[6]) < currentTime;
      console.log(`  - Is expired: ${isExpired}`);
      console.log(`  - Current time: ${currentTime}`);
      console.log(`  - Expiry time: ${listing[6].toString()}`);
    } catch (error) {
      console.log(`Listing ${i}: Error - ${error.message}`);
    }
  }

  console.log("\n=== STEP 2: CHECK SPECIFIC LISTING (ID: 6) ===");
  
  try {
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

    // Check if listing is expired
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = Number(listing6[6]) < currentTime;
    console.log(`Is expired: ${isExpired}`);
    console.log(`Current time: ${currentTime}`);
    console.log(`Expiry time: ${listing6[6].toString()}`);

    // Check if listing is active
    console.log(`Is active: ${listing6[7]}`);

  } catch (error) {
    console.log("Error checking listing 6:", error.message);
  }

  console.log("\n=== STEP 3: TEST LISTING EXISTS MODIFIER ===");
  
  // Test the listingExists modifier by trying to get listing details
  try {
    const listingExists = await marketplaceContract.listings(6);
    console.log("✅ Listing 6 exists and is accessible");
  } catch (error) {
    console.log("❌ Listing 6 does not exist or is not accessible:", error.message);
  }

  // Test with a non-existent listing
  try {
    const listing999 = await marketplaceContract.listings(999);
    console.log("❌ Listing 999 should not exist but is accessible");
  } catch (error) {
    console.log("✅ Listing 999 correctly does not exist:", error.message);
  }

  console.log("\n=== STEP 4: CHECK BUYER PERMISSIONS ===");
  
  // Check if buyer has enough tokens
  const buyerAddress = "0xDE800c6278D82813AFd5104c365693C19B82F206"; // Correct buyer address from error log
  console.log("Buyer address:", buyerAddress);
  
  // Get token contract
  const tokenAddress = deploymentInfo.contracts.AgriChainToken;
  const AgriChainToken = await ethers.getContractFactory("AgriChainToken");
  const tokenContract = AgriChainToken.attach(tokenAddress);
  
  const buyerBalance = await tokenContract.balanceOf(buyerAddress);
  console.log("Buyer token balance:", ethers.formatEther(buyerBalance), "AGRI");
  
  // Check if buyer has approved marketplace
  const allowance = await tokenContract.allowance(buyerAddress, marketplaceAddress);
  console.log("Buyer allowance for marketplace:", ethers.formatEther(allowance), "AGRI");

  console.log("\n=== STEP 5: SIMULATE BUY TRANSACTION ===");
  
  // Try to simulate the buy transaction
  try {
    const listing6 = await marketplaceContract.listings(6);
    const price = listing6[3];
    const quantity = 1;
    
    console.log("Attempting to buy listing 6...");
    console.log("Price:", ethers.formatEther(price), "AGRI");
    console.log("Quantity:", quantity);
    
    // This will fail if there are issues
    const buyTx = await marketplaceContract.buyProduct(6, quantity);
    console.log("✅ Buy transaction successful:", buyTx.hash);
    
  } catch (error) {
    console.log("❌ Buy transaction failed:", error.message);
    
    // Check if it's the listingExists error
    if (error.message.includes("Listing does not exist")) {
      console.log("🔍 This is the same error the user is experiencing!");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
