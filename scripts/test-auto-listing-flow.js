const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Auto Listing Flow...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Supplier (deployer):", deployer.address);

  // Get contract addresses
  const deploymentInfo = require("../deployment-info.json");
  const tokenAddress = deploymentInfo.contracts.AgriChainToken;
  const nftAddress = deploymentInfo.contracts.AgriChainNFT;
  const marketplaceAddress = deploymentInfo.contracts.AgriChainMarketplace;

  // Get contracts
  const AgriChainToken = await ethers.getContractFactory("AgriChainToken");
  const AgriChainNFT = await ethers.getContractFactory("AgriChainNFT");
  const AgriChainMarketplace = await ethers.getContractFactory("AgriChainMarketplace");

  const tokenContract = AgriChainToken.attach(tokenAddress);
  const nftContract = AgriChainNFT.attach(nftAddress);
  const marketplaceContract = AgriChainMarketplace.attach(marketplaceAddress);

  console.log("\n=== STEP 1: CHECK AUTHORIZATIONS ===");
  
  // Check if marketplace is authorized as minter
  const isMarketplaceAuthorized = await tokenContract.authorizedMinters(marketplaceAddress);
  console.log("✅ Marketplace authorized as minter:", isMarketplaceAuthorized);

  // Check if deployer is authorized supplier
  const isSupplierAuthorized = await nftContract.isAuthorizedSupplier(deployer.address);
  console.log("✅ Supplier authorized:", isSupplierAuthorized);

  if (!isMarketplaceAuthorized || !isSupplierAuthorized) {
    console.log("❌ Missing authorizations. Please run setup scripts first.");
    return;
  }

  console.log("\n=== STEP 2: SIMULATE MINT NFT ===");
  
  // Get current total products
  const totalProductsBefore = await nftContract.getTotalProducts();
  console.log("Total products before mint:", totalProductsBefore.toString());

  // Mint a new NFT
  const mintTx = await nftContract.mintProductNFT(
    1, // amount
    "Test Auto Listing Product", // name
    "Product for testing auto listing", // description
    "VEGETABLES", // category
    ethers.parseEther("0.002"), // price (0.002 AGRI)
    1, // quantity
    "kg", // unit
    true, // isOrganic
    Math.floor(Date.now() / 1000), // harvestDate
    "Test Farm", // location
    "https://agrichain.com/metadata/auto-test" // metadata
  );

  console.log("✅ Mint transaction sent:", mintTx.hash);
  const mintReceipt = await mintTx.wait();
  console.log("✅ Mint transaction confirmed:", mintReceipt.hash);

  // Get new token ID
  const totalProductsAfter = await nftContract.getTotalProducts();
  const newTokenId = totalProductsAfter;
  console.log("New token ID:", newTokenId.toString());

  // Check NFT balance
  const nftBalance = await nftContract.balanceOf(deployer.address, newTokenId);
  console.log("NFT balance:", nftBalance.toString());

  console.log("\n=== STEP 3: SIMULATE AUTO LISTING ===");
  
  // Approve marketplace to transfer NFTs
  console.log("🔐 Approving marketplace for NFT transfers...");
  const approveTx = await nftContract.setApprovalForAll(marketplaceAddress, true);
  await approveTx.wait();
  console.log("✅ Marketplace approved for NFT transfers");

  // Create listing
  const price = ethers.parseEther("0.002"); // 0.002 AGRI
  const quantity = 1;
  const expiryTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days

  console.log("📝 Creating listing...");
  console.log("Token ID:", newTokenId.toString());
  console.log("Price:", ethers.formatEther(price), "AGRI");
  console.log("Quantity:", quantity);
  console.log("Expiry:", new Date(expiryTime * 1000).toISOString());

  const listTx = await marketplaceContract.listProduct(
    newTokenId,
    price,
    quantity,
    expiryTime
  );

  console.log("📝 Listing transaction sent:", listTx.hash);
  const listReceipt = await listTx.wait();
  console.log("✅ Listing transaction confirmed:", listReceipt.hash);

  // Get listing ID from event
  let listingId;
  const event = listReceipt.logs.find(log => {
    try {
      const parsed = marketplaceContract.interface.parseLog(log);
      return parsed?.name === 'ProductListed';
    } catch {
      return false;
    }
  });

  if (event) {
    const parsedEvent = marketplaceContract.interface.parseLog(event);
    listingId = parsedEvent?.args[0];
    console.log("🎉 Listing created with ID:", listingId.toString());
    console.log("📋 Listing details:");
    console.log("  - Token ID:", parsedEvent?.args[1].toString());
    console.log("  - Supplier:", parsedEvent?.args[2]);
    console.log("  - Price:", ethers.formatEther(parsedEvent?.args[3]), "AGRI");
    console.log("  - Quantity:", parsedEvent?.args[4].toString());
    console.log("  - Expiry:", new Date(Number(parsedEvent?.args[5]) * 1000).toISOString());
  } else {
    console.log("❌ ProductListed event not found");
    return;
  }

  console.log("\n=== STEP 4: VERIFY LISTING ===");
  
  // Verify listing exists
  const listing = await marketplaceContract.listings(listingId);
  console.log("Listing verification:", {
    listingId: listing[0].toString(),
    tokenId: listing[1].toString(),
    supplier: listing[2],
    price: listing[3].toString(),
    quantity: listing[4].toString(),
    remainingQuantity: listing[5].toString(),
    expiryTime: listing[6].toString(),
    isActive: listing[7]
  });

  console.log("\n🎉 Auto Listing Flow Test Completed Successfully!");
  console.log("✅ NFT minted with token ID:", newTokenId.toString());
  console.log("✅ Listing created with ID:", listingId.toString());
  console.log("✅ Ready for buyers to purchase!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
