const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking NFT balances...");
  
  // Contract addresses
  const nftAddress = "0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41";
  
  // Get NFT contract
  const nftContract = await ethers.getContractAt("AgriChainNFT", nftAddress);
  
  // Check balances for different token IDs
  for (let tokenId = 1; tokenId <= 5; tokenId++) {
    const balance = await nftContract.balanceOf(supplierAddress, tokenId);
    console.log(`Token ID ${tokenId}: ${balance.toString()}`);
  }
  
  // Check next token ID
  const nextTokenId = await nftContract.nextTokenId();
  console.log(`Next Token ID: ${nextTokenId.toString()}`);
  
  // Check product info for token 1
  try {
    const productInfo = await nftContract.productInfo(1);
    console.log("\n📦 Product Info for Token 1:");
    console.log("Name:", productInfo.name);
    console.log("Is Active:", productInfo.isActive);
    console.log("Quantity:", productInfo.quantity.toString());
  } catch (error) {
    console.log("❌ Error getting product info:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
