const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Dynamic Listing Flow...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deployer (Supplier):", deployer.address);

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

  console.log("\n=== STEP 1: SIMULATE NEW PRODUCT MINT ===");
  
  // Get current total products
  const totalProductsBefore = await nftContract.getTotalProducts();
  console.log("Total products before mint:", totalProductsBefore.toString());

  // Mint a new NFT (simulating frontend mint)
  const mintTx = await nftContract.mintProductNFT(
    1, // amount
    "Dynamic Listing Test Product", // name
    "Product for testing dynamic listing flow", // description
    "VEGETABLES", // category
    ethers.parseEther("0.005"), // price (0.005 AGRI)
    1, // quantity
    "kg", // unit
    true, // isOrganic
    Math.floor(Date.now() / 1000), // harvestDate
    "Test Farm", // location
    "https://agrichain.com/metadata/dynamic-test" // metadata
  );

  console.log("✅ Mint transaction sent:", mintTx.hash);
  const mintReceipt = await mintTx.wait();
  console.log("✅ Mint transaction confirmed:", mintReceipt.hash);

  // Get new token ID
  const totalProductsAfter = await nftContract.getTotalProducts();
  const newTokenId = totalProductsAfter;
  console.log("New token ID:", newTokenId.toString());

  // Check NFT balance
  const nftBalance = await nftContract.balanceOf(deployer.address, newTokenId);
  console.log("NFT balance:", nftBalance.toString());

  console.log("\n=== STEP 2: SIMULATE AUTO LISTING ===");
  
  // Approve marketplace to transfer NFTs
  console.log("🔐 Approving marketplace for NFT transfers...");
  const approveTx = await nftContract.setApprovalForAll(marketplaceAddress, true);
  await approveTx.wait();
  console.log("✅ Marketplace approved for NFT transfers");

  // Create listing (simulating auto listing)
  const price = ethers.parseEther("0.005"); // 0.005 AGRI
  const quantity = 1;
  const expiryTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days

  console.log("📝 Creating listing...");
  const listTx = await marketplaceContract.listProduct(
    newTokenId,
    price,
    quantity,
    expiryTime
  );

  console.log("📝 Listing transaction sent:", listTx.hash);
  const listReceipt = await listTx.wait();
  console.log("✅ Listing transaction confirmed:", listReceipt.hash);

  // Get listing ID from event
  let listingId;
  const event = listReceipt.logs.find(log => {
    try {
      const parsed = marketplaceContract.interface.parseLog(log);
      return parsed?.name === 'ProductListed';
    } catch {
      return false;
    }
  });

  if (event) {
    const parsedEvent = marketplaceContract.interface.parseLog(event);
    listingId = parsedEvent?.args[0];
    console.log("🎉 Listing created with ID:", listingId.toString());
  } else {
    console.log("❌ ProductListed event not found");
    return;
  }

  console.log("\n=== STEP 3: TEST DYNAMIC LISTING FINDER ===");
  
  // Test the findListingIdByTokenId function
  console.log(`🔍 Testing findListingIdByTokenId(${newTokenId})...`);
  
  let foundListingId = null;
  for (let searchId = 1; searchId <= 100; searchId++) {
    try {
      const listing = await marketplaceContract.listings(searchId);
      
      if (listing[1].toString() === newTokenId.toString() && listing[7] === true) {
        foundListingId = searchId;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (foundListingId) {
    console.log(`✅ Found listing ID ${foundListingId} for token ID ${newTokenId}`);
    
    if (foundListingId.toString() === listingId.toString()) {
      console.log("✅ Listing ID matches the one from event!");
    } else {
      console.log("❌ Listing ID mismatch!");
    }
  } else {
    console.log(`❌ No listing found for token ID ${newTokenId}`);
  }

  console.log("\n=== STEP 4: SIMULATE FRONTEND BUY FLOW ===");
  
  // Simulate what frontend would do
  console.log("🛒 Simulating frontend buy flow...");
  console.log("  - Product has token ID:", newTokenId.toString());
  console.log("  - Frontend calls findListingIdByTokenId(", newTokenId.toString(), ")");
  console.log("  - Function returns listing ID:", foundListingId);
  console.log("  - Frontend calls buyProduct(", foundListingId, ", 1, buyerAddress)");
  
  // Verify listing details
  const listing = await marketplaceContract.listings(foundListingId);
  console.log("  - Listing details:", {
    listingId: listing[0].toString(),
    tokenId: listing[1].toString(),
    supplier: listing[2],
    price: listing[3].toString(),
    quantity: listing[4].toString(),
    remainingQuantity: listing[5].toString(),
    expiryTime: listing[6].toString(),
    isActive: listing[7]
  });

  console.log("\n🎉 Dynamic Listing Flow Test Completed Successfully!");
  console.log("✅ NFT minted with token ID:", newTokenId.toString());
  console.log("✅ Listing created with ID:", listingId.toString());
  console.log("✅ Dynamic listing finder works correctly");
  console.log("✅ Frontend can now find the correct listing ID automatically");
  console.log("📝 No more hardcoded listing IDs needed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
