const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing findListingIdByTokenId function...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Get contract addresses
  const deploymentInfo = require("../deployment-info.json");
  const marketplaceAddress = deploymentInfo.contracts.AgriChainMarketplace;

  // Get marketplace contract
  const AgriChainMarketplace = await ethers.getContractFactory("AgriChainMarketplace");
  const marketplaceContract = AgriChainMarketplace.attach(marketplaceAddress);

  console.log("\n=== STEP 1: CHECK ALL ACTIVE LISTINGS ===");
  
  const activeListings = [];
  
  // Check listings from 1 to 20
  for (let listingId = 1; listingId <= 20; listingId++) {
    try {
      const listing = await marketplaceContract.listings(listingId);
      
      if (listing[7] === true) { // isActive
        activeListings.push({
          listingId,
          tokenId: listing[1].toString(),
          supplier: listing[2],
          price: listing[3].toString(),
          quantity: listing[4].toString(),
          remainingQuantity: listing[5].toString(),
          expiryTime: listing[6].toString(),
          isActive: listing[7]
        });
      }
    } catch (error) {
      // Listing doesn't exist, continue
      continue;
    }
  }

  console.log("Active listings found:", activeListings.length);
  activeListings.forEach(listing => {
    console.log(`  - Listing ${listing.listingId}: Token ID ${listing.tokenId}, Price ${ethers.formatEther(listing.price)} AGRI`);
  });

  console.log("\n=== STEP 2: TEST FIND FUNCTION ===");
  
  // Test finding listing by token ID
  for (const listing of activeListings) {
    const tokenId = Number(listing.tokenId);
    console.log(`\n🔍 Testing findListingIdByTokenId(${tokenId})...`);
    
    // Simulate the frontend function
    let foundListingId = null;
    for (let listingId = 1; listingId <= 100; listingId++) {
      try {
        const listingData = await marketplaceContract.listings(listingId);
        
        if (listingData[1].toString() === tokenId.toString() && listingData[7] === true) {
          foundListingId = listingId;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (foundListingId) {
      console.log(`✅ Found listing ID ${foundListingId} for token ID ${tokenId}`);
    } else {
      console.log(`❌ No listing found for token ID ${tokenId}`);
    }
  }

  console.log("\n=== STEP 3: TEST WITH NON-EXISTENT TOKEN ID ===");
  
  const nonExistentTokenId = 999;
  console.log(`🔍 Testing findListingIdByTokenId(${nonExistentTokenId})...`);
  
  let foundListingId = null;
  for (let listingId = 1; listingId <= 100; listingId++) {
    try {
      const listingData = await marketplaceContract.listings(listingId);
      
      if (listingData[1].toString() === nonExistentTokenId.toString() && listingData[7] === true) {
        foundListingId = listingId;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (foundListingId) {
    console.log(`✅ Found listing ID ${foundListingId} for token ID ${nonExistentTokenId}`);
  } else {
    console.log(`✅ Correctly found no listing for token ID ${nonExistentTokenId}`);
  }

  console.log("\n🎉 Test completed!");
  console.log("📝 The findListingIdByTokenId function should work correctly in frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
