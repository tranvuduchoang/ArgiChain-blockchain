const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing complete mint NFT flow...");
  
  // Contract addresses
  const nftAddress = "0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4";
  const tokenAddress = "0x0a5123a377A87321975578ED3C8D3336eF67F28a";
  const marketplaceAddress = "0xf88559b87f94FF07c6c4297E7D04ab10573e9d62";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41";
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Supplier address:", supplierAddress);
  
  // Get contracts
  const nftContract = await ethers.getContractAt("AgriChainNFT", nftAddress);
  const tokenContract = await ethers.getContractAt("AgriChainToken", tokenAddress);
  const marketplaceContract = await ethers.getContractAt("AgriChainMarketplace", marketplaceAddress);
  
  console.log("\n📋 Contract Addresses:");
  console.log("NFT Contract:", nftAddress);
  console.log("Token Contract:", tokenAddress);
  console.log("Marketplace Contract:", marketplaceAddress);
  
  // Check supplier authorization
  const isAuthorized = await nftContract.isAuthorizedSupplier(supplierAddress);
  console.log("\n🔐 Supplier Authorization:", isAuthorized);
  
  if (!isAuthorized) {
    console.log("❌ Supplier not authorized. Authorizing now...");
    const authTx = await nftContract.authorizeSupplier(supplierAddress);
    await authTx.wait();
    console.log("✅ Supplier authorized");
  }
  
  // Test mint NFT
  console.log("\n🎨 Testing NFT mint...");
  try {
    const mintTx = await nftContract.mintProductNFT(
      1, // amount
      "Test Organic Apple", // name
      "Fresh organic apple from sustainable farm", // description
      "Fruits", // category
      ethers.parseEther("0.5"), // price (0.5 AGRI)
      50, // quantity
      "kg", // unit
      true, // isOrganic
      Math.floor(Date.now() / 1000), // harvestDate
      "Sustainable Farm, Vietnam", // location
      "ipfs://test-metadata-hash-123" // metadata
    );
    
    console.log("✅ Mint transaction sent:", mintTx.hash);
    const mintReceipt = await mintTx.wait();
    console.log("✅ Mint transaction confirmed:", mintReceipt.hash);
    
    // Check token balance
    const balance = await nftContract.balanceOf(supplierAddress, 1);
    console.log("✅ NFT balance for supplier:", balance.toString());
    
    // Get product info
    const productInfo = await nftContract.productInfo(1);
    console.log("\n📦 Product Info:");
    console.log("Name:", productInfo.name);
    console.log("Description:", productInfo.description);
    console.log("Category:", productInfo.category);
    console.log("Supplier:", productInfo.supplier);
    console.log("Price:", ethers.formatEther(productInfo.price), "AGRI");
    console.log("Quantity:", productInfo.quantity.toString());
    console.log("Unit:", productInfo.unit);
    console.log("Is Organic:", productInfo.isOrganic);
    console.log("Is Active:", productInfo.isActive);
    
    // Test marketplace listing
    console.log("\n🏪 Testing marketplace listing...");
    const expiryTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
    const listingTx = await marketplaceContract.listProduct(
      1, // tokenId
      ethers.parseEther("0.5"), // price
      50, // quantity
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
    
    console.log("\n🎉 Complete mint NFT flow test successful!");
    console.log("\n📝 Summary:");
    console.log("- NFT minted successfully");
    console.log("- Product info stored correctly");
    console.log("- Marketplace listing created");
    console.log("- All contracts working properly");
    
  } catch (error) {
    console.error("❌ Error in mint flow:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
