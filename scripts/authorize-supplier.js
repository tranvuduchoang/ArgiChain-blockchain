const { ethers } = require("hardhat");

async function main() {
  console.log("🔐 Authorizing supplier...");
  
  // Contract addresses
  const nftAddress = "0x926c97edE710Dfdcef56e0f9f1Fe2352F7b330ca";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41"; // Test1 wallet
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Supplier address:", supplierAddress);
  
  // Get NFT contract
  const nftContract = await ethers.getContractAt("AgriChainNFT", nftAddress);
  
  // Check if supplier is already authorized
  const isAuthorized = await nftContract.isAuthorizedSupplier(supplierAddress);
  console.log("Is supplier already authorized:", isAuthorized);
  
  if (isAuthorized) {
    console.log("✅ Supplier is already authorized");
    return;
  }
  
  // Authorize supplier
  try {
    console.log("🔐 Authorizing supplier...");
    const tx = await nftContract.authorizeSupplier(supplierAddress);
    console.log("✅ Authorization transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Authorization transaction confirmed:", receipt.hash);
    
    // Verify authorization
    const isNowAuthorized = await nftContract.isAuthorizedSupplier(supplierAddress);
    console.log("✅ Supplier is now authorized:", isNowAuthorized);
    
  } catch (error) {
    console.error("❌ Error authorizing supplier:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
