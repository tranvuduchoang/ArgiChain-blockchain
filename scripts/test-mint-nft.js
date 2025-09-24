const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing NFT mint functionality...");
  
  // Contract addresses
  const nftAddress = "0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41"; // Test1 wallet
  
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
  try {
    console.log("🎨 Minting test NFT...");
    const mintTx = await nftContract.mintProductNFT(
      1, // amount
      "Test Apple", // name
      "Fresh organic apple from test farm", // description
      "Fruits", // category
      ethers.parseEther("0.1"), // price (0.1 AGRI)
      100, // quantity
      "kg", // unit
      true, // isOrganic
      Math.floor(Date.now() / 1000), // harvestDate
      "Test Farm, Vietnam", // location
      "ipfs://test-metadata-hash" // metadata
    );
    
    console.log("✅ Mint transaction sent:", mintTx.hash);
    const receipt = await mintTx.wait();
    console.log("✅ Mint transaction confirmed:", receipt.hash);
    
    // Check token balance
    const balance = await nftContract.balanceOf(supplierAddress, 1);
    console.log("✅ NFT balance for supplier:", balance.toString());
    
    // Get product info
    const productInfo = await nftContract.productInfo(1);
    console.log("✅ Product info:", {
      name: productInfo.name,
      description: productInfo.description,
      category: productInfo.category,
      supplier: productInfo.supplier,
      price: ethers.formatEther(productInfo.price),
      quantity: productInfo.quantity.toString(),
      unit: productInfo.unit,
      isOrganic: productInfo.isOrganic,
      isActive: productInfo.isActive
    });
    
  } catch (error) {
    console.error("❌ Error minting NFT:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
