const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging contract from frontend perspective...");
  
  // Contract addresses
  const nftAddress = "0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41";
  
  // Simulate frontend environment with BSC Testnet RPC
  const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  console.log("Using RPC URL:", rpcUrl);
  console.log("Contract Address:", nftAddress);
  console.log("Supplier Address:", supplierAddress);
  
  try {
    // Get contract instance
    const nftContract = new ethers.Contract(nftAddress, [
      "function isAuthorizedSupplier(address supplier) external view returns (bool)",
      "function balanceOf(address account, uint256 id) external view returns (uint256)",
      "function productInfo(uint256 tokenId) external view returns (tuple(string name, string description, string category, address supplier, uint256 price, uint256 quantity, string unit, bool isOrganic, uint256 harvestDate, string location, string metadata, bool isActive))"
    ], provider);
    
    // Check if contract exists
    console.log("\n📋 Checking contract existence...");
    const code = await provider.getCode(nftAddress);
    console.log("Contract code length:", code.length);
    console.log("Contract exists:", code !== "0x");
    
    if (code === "0x") {
      console.log("❌ Contract does not exist at this address!");
      return;
    }
    
    // Check supplier authorization
    console.log("\n🔐 Checking supplier authorization...");
    try {
      const isAuthorized = await nftContract.isAuthorizedSupplier(supplierAddress);
      console.log("✅ Is authorized supplier:", isAuthorized);
    } catch (error) {
      console.error("❌ Error checking authorization:", error.message);
    }
    
    // Check NFT balance
    console.log("\n💰 Checking NFT balance...");
    try {
      const balance = await nftContract.balanceOf(supplierAddress, 1);
      console.log("✅ NFT balance for token 1:", balance.toString());
    } catch (error) {
      console.error("❌ Error checking balance:", error.message);
    }
    
    // Check product info
    console.log("\n📦 Checking product info...");
    try {
      const productInfo = await nftContract.productInfo(1);
      console.log("✅ Product info:", {
        name: productInfo.name,
        isActive: productInfo.isActive
      });
    } catch (error) {
      console.error("❌ Error checking product info:", error.message);
    }
    
    // Check network
    console.log("\n🌐 Checking network...");
    const network = await provider.getNetwork();
    console.log("Network chain ID:", network.chainId.toString());
    console.log("Expected chain ID: 97 (BSC Testnet)");
    
  } catch (error) {
    console.error("❌ General error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
