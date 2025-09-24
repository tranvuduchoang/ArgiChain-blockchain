const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Buy Listing 6 with Real Buyer...");

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

  console.log("\n=== STEP 1: CHECK LISTING 6 ===");
  
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

  console.log("\n=== STEP 2: CHECK BUYER STATUS ===");
  
  // Check buyer token balance
  const buyerBalance = await tokenContract.balanceOf(buyerAddress);
  console.log("Buyer token balance:", ethers.formatEther(buyerBalance), "AGRI");
  
  // Check buyer allowance
  const allowance = await tokenContract.allowance(buyerAddress, marketplaceAddress);
  console.log("Buyer allowance for marketplace:", ethers.formatEther(allowance), "AGRI");
  
  // Check if buyer has enough tokens
  const price = listing6[3];
  const quantity = 1;
  const totalPrice = price * BigInt(quantity);
  
  console.log("Required price:", ethers.formatEther(totalPrice), "AGRI");
  console.log("Buyer has enough tokens:", buyerBalance >= totalPrice);
  console.log("Buyer has enough allowance:", allowance >= totalPrice);

  console.log("\n=== STEP 3: SIMULATE BUY TRANSACTION ===");
  
  // This will fail because we can't sign transactions for the buyer
  // But we can check if the transaction would work
  try {
    // Check if listing exists and is active
    if (!listing6[7]) {
      throw new Error("Listing is not active");
    }
    
    // Check if listing is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (Number(listing6[6]) < currentTime) {
      throw new Error("Listing is expired");
    }
    
    // Check if buyer has enough tokens
    if (buyerBalance < totalPrice) {
      throw new Error("Insufficient token balance");
    }
    
    // Check if buyer has enough allowance
    if (allowance < totalPrice) {
      throw new Error("Insufficient allowance - buyer needs to approve marketplace");
    }
    
    console.log("✅ All checks passed! Transaction should work if buyer signs it.");
    console.log("📝 Buyer needs to:");
    console.log("  1. Approve marketplace for", ethers.formatEther(totalPrice), "AGRI tokens");
    console.log("  2. Call buyProduct(6, 1) on marketplace contract");
    
  } catch (error) {
    console.log("❌ Transaction would fail:", error.message);
  }

  console.log("\n=== STEP 4: CHECK FRONTEND ISSUE ===");
  
  // The issue might be in the frontend
  console.log("🔍 Possible frontend issues:");
  console.log("  1. Buyer might not have approved marketplace");
  console.log("  2. Frontend might be using wrong listing ID");
  console.log("  3. Frontend might be using wrong buyer address");
  console.log("  4. Network mismatch between frontend and blockchain");
  
  console.log("\n📋 Frontend should check:");
  console.log("  - Buyer address:", buyerAddress);
  console.log("  - Listing ID: 6");
  console.log("  - Required approval:", ethers.formatEther(totalPrice), "AGRI");
  console.log("  - Network: BSC Testnet (Chain ID: 97)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
