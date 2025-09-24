const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing with exact frontend conditions...");
  
  // Exact same addresses as frontend
  const nftAddress = "0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41";
  
  // Use BSC Testnet RPC (same as frontend)
  const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  console.log("RPC URL:", rpcUrl);
  console.log("Contract Address:", nftAddress);
  console.log("Supplier Address:", supplierAddress);
  
  try {
    // Check network
    const network = await provider.getNetwork();
    console.log("Network chain ID:", network.chainId.toString());
    
    // Check contract existence
    const code = await provider.getCode(nftAddress);
    console.log("Contract exists:", code !== "0x");
    
    if (code === "0x") {
      console.log("❌ Contract does not exist!");
      return;
    }
    
    // Create contract instance with exact ABI from frontend
    const AGRICHAIN_NFT_ABI = [
      "function mintProductNFT(uint256 amount, string memory name, string memory description, string memory category, uint256 price, uint256 quantity, string memory unit, bool isOrganic, uint256 harvestDate, string memory location, string memory metadata) external",
      "function isAuthorizedSupplier(address supplier) external view returns (bool)",
      "function balanceOf(address account, uint256 id) external view returns (uint256)",
      "function productInfo(uint256 tokenId) external view returns (tuple(string name, string description, string category, address supplier, uint256 price, uint256 quantity, string unit, bool isOrganic, uint256 harvestDate, string location, string metadata, bool isActive))",
      "event ProductNFTMinted(uint256 indexed tokenId, address indexed supplier, uint256 amount, string productName, string metadata)"
    ];
    
    const nftContract = new ethers.Contract(nftAddress, AGRICHAIN_NFT_ABI, provider);
    
    // Test isAuthorizedSupplier (this is what's failing in frontend)
    console.log("\n🔐 Testing isAuthorizedSupplier...");
    try {
      const isAuthorized = await nftContract.isAuthorizedSupplier(supplierAddress);
      console.log("✅ Is authorized supplier:", isAuthorized);
    } catch (error) {
      console.error("❌ Error calling isAuthorizedSupplier:", error.message);
      console.error("Error code:", error.code);
      console.error("Error info:", error.info);
    }
    
    // Test balanceOf
    console.log("\n💰 Testing balanceOf...");
    try {
      const balance = await nftContract.balanceOf(supplierAddress, 1);
      console.log("✅ Balance for token 1:", balance.toString());
    } catch (error) {
      console.error("❌ Error calling balanceOf:", error.message);
    }
    
    // Test with different token IDs
    for (let tokenId = 1; tokenId <= 3; tokenId++) {
      try {
        const balance = await nftContract.balanceOf(supplierAddress, tokenId);
        console.log(`Token ${tokenId} balance:`, balance.toString());
      } catch (error) {
        console.log(`Token ${tokenId} error:`, error.message);
      }
    }
    
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
