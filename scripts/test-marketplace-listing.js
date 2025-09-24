const { ethers } = require("hardhat");

async function main() {
  console.log("🏪 Testing marketplace listing...");
  
  // Contract addresses
  const nftAddress = "0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4";
  const marketplaceAddress = "0xf88559b87f94FF07c6c4297E7D04ab10573e9d62";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41";
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Supplier address:", supplierAddress);
  
  // Get contracts
  const nftContract = await ethers.getContractAt("AgriChainNFT", nftAddress);
  const marketplaceContract = await ethers.getContractAt("AgriChainMarketplace", marketplaceAddress);
  
  // Check if supplier is authorized
  const isAuthorized = await nftContract.isAuthorizedSupplier(supplierAddress);
  console.log("Is supplier authorized:", isAuthorized);
  
  if (!isAuthorized) {
    console.log("❌ Supplier not authorized. Authorizing now...");
    const authTx = await nftContract.authorizeSupplier(supplierAddress);
    await authTx.wait();
    console.log("✅ Supplier authorized");
  }
  
  // Test marketplace listing with token ID 1
  console.log("\n🏪 Testing marketplace listing with Token ID 1...");
  try {
    const expiryTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
    const listingTx = await marketplaceContract.listProduct(
      1, // tokenId
      ethers.parseEther("0.5"), // price
      1, // quantity (only 1 available)
      expiryTime // 7 days expiry
    );
    
    console.log("✅ Listing transaction sent:", listingTx.hash);
    const listingReceipt = await listingTx.wait();
    console.log("✅ Listing transaction confirmed:", listingReceipt.hash);
    
    // Get listing info
    const listing = await marketplaceContract.listings(1);
    console.log("\n📋 Listing Info:");
    console.log("Listing ID:", listing.listingId.toString());
    console.log("Token ID:", listing.tokenId.toString());
    console.log("Supplier:", listing.supplier);
    console.log("Price:", ethers.formatEther(listing.price), "AGRI");
    console.log("Quantity:", listing.quantity.toString());
    console.log("Remaining:", listing.remainingQuantity.toString());
    console.log("Is Active:", listing.isActive);
    
    console.log("\n🎉 Marketplace listing test successful!");
    
  } catch (error) {
    console.error("❌ Error in marketplace listing:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
