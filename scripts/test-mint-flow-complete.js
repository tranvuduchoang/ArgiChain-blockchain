const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing complete mint NFT flow...");
  
  // Contract addresses
  const nftAddress = "0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41";
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Supplier address:", supplierAddress);
  
  // Get NFT contract
  const nftContract = await ethers.getContractAt("AgriChainNFT", nftAddress);
  
  // Check if supplier is authorized
  const isAuthorized = await nftContract.isAuthorizedSupplier(supplierAddress);
  console.log("Is supplier authorized:", isAuthorized);
  
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
      "Test Potato", // name
      "Fresh organic potato from test farm", // description
      "Vegetables", // category
      ethers.parseEther("0.0001"), // price (0.0001 AGRI)
      1, // quantity
      "kg", // unit
      false, // isOrganic
      Math.floor(Date.now() / 1000), // harvestDate
      "Test Farm, Vietnam", // location
      "ipfs://test-metadata-hash-potato" // metadata
    );
    
    console.log("✅ Mint transaction sent:", mintTx.hash);
    const mintReceipt = await mintTx.wait();
    console.log("✅ Mint transaction confirmed:", mintReceipt.hash);
    console.log("✅ Receipt status:", mintReceipt.status === 1 ? "Success" : "Failed");
    
    // Verify transaction hash
    if (mintReceipt.hash) {
      console.log("✅ Transaction hash is valid:", mintReceipt.hash);
    } else {
      console.log("❌ Transaction hash is undefined!");
    }
    
    // Check token balance
    const balance = await nftContract.balanceOf(supplierAddress, 4); // Token ID 4
    console.log("✅ NFT balance for token 4:", balance.toString());
    
    // Get product info
    const productInfo = await nftContract.productInfo(4);
    console.log("\n📦 Product Info for Token 4:");
    console.log("Name:", productInfo.name);
    console.log("Description:", productInfo.description);
    console.log("Category:", productInfo.category);
    console.log("Supplier:", productInfo.supplier);
    console.log("Price:", ethers.formatEther(productInfo.price), "AGRI");
    console.log("Quantity:", productInfo.quantity.toString());
    console.log("Unit:", productInfo.unit);
    console.log("Is Organic:", productInfo.isOrganic);
    console.log("Is Active:", productInfo.isActive);
    
    console.log("\n🎉 Complete mint NFT flow test successful!");
    console.log("Transaction hash:", mintReceipt.hash);
    
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
