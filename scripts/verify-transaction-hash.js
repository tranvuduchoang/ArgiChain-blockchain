const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying transaction hash...");
  
  // Transaction hash from user
  const txHash = "0x1d9437202e90b3f7e2dedcc909e2b77291a8a3e8e1d97cf327cc5958ddeec05a";
  const nftAddress = "0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4";
  const supplierAddress = "0x72654b545038460716F13f9f30838136D68F5a41";
  
  // Use BSC Testnet RPC
  const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  try {
    // Get transaction details
    console.log("📋 Getting transaction details...");
    const tx = await provider.getTransaction(txHash);
    console.log("Transaction found:", !!tx);
    console.log("From:", tx.from);
    console.log("To:", tx.to);
    console.log("Value:", ethers.formatEther(tx.value), "BNB");
    console.log("Gas used:", tx.gasLimit.toString());
    
    // Get transaction receipt
    console.log("\n📋 Getting transaction receipt...");
    const receipt = await provider.getTransactionReceipt(txHash);
    console.log("Receipt found:", !!receipt);
    console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Block number:", receipt.blockNumber.toString());
    
    // Check NFT contract events
    console.log("\n📋 Checking NFT contract events...");
    const nftContract = new ethers.Contract(nftAddress, [
      "event ProductNFTMinted(uint256 indexed tokenId, address indexed supplier, uint256 amount, string productName, string metadata)"
    ], provider);
    
    // Get events from the transaction
    const events = await nftContract.queryFilter(
      nftContract.filters.ProductNFTMinted(),
      receipt.blockNumber,
      receipt.blockNumber
    );
    
    console.log("Events found:", events.length);
    events.forEach((event, index) => {
      console.log(`Event ${index + 1}:`, {
        tokenId: event.args.tokenId.toString(),
        supplier: event.args.supplier,
        amount: event.args.amount.toString(),
        productName: event.args.productName
      });
    });
    
    // Check NFT balance
    console.log("\n💰 Checking NFT balance...");
    const balanceContract = new ethers.Contract(nftAddress, [
      "function balanceOf(address account, uint256 id) external view returns (uint256)"
    ], provider);
    
    for (let tokenId = 1; tokenId <= 5; tokenId++) {
      const balance = await balanceContract.balanceOf(supplierAddress, tokenId);
      console.log(`Token ${tokenId} balance:`, balance.toString());
    }
    
    console.log("\n✅ Transaction verification complete!");
    
  } catch (error) {
    console.error("❌ Error verifying transaction:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
