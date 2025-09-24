const { ethers } = require("hardhat");

async function main() {
  console.log("📋 Creating listing for newly minted NFT...");

  // Get the deployer account (supplier)
  const [deployer] = await ethers.getSigners();
  console.log("Supplier address:", deployer.address);

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

  // Check if deployer is authorized supplier
  const isAuthorized = await nftContract.isAuthorizedSupplier(deployer.address);
  console.log("Is authorized supplier:", isAuthorized);

  if (!isAuthorized) {
    console.log("❌ Deployer is not authorized supplier");
    return;
  }

  // Find the latest minted NFT token ID
  const totalProducts = await nftContract.getTotalProducts();
  console.log("Total products minted:", totalProducts.toString());

  if (totalProducts == 0) {
    console.log("❌ No NFTs minted yet");
    return;
  }

  // Check NFT balance for the latest token ID
  const latestTokenId = totalProducts;
  const balance = await nftContract.balanceOf(deployer.address, latestTokenId);
  console.log(`NFT balance for token ID ${latestTokenId}:`, balance.toString());

  if (balance == 0) {
    console.log("❌ No NFT balance for latest token");
    return;
  }

  // Get product info
  const productInfo = await nftContract.getProductInfo(latestTokenId);
  console.log("Product info:", {
    name: productInfo.name,
    description: productInfo.description,
    category: productInfo.category,
    price: ethers.formatEther(productInfo.price),
    quantity: productInfo.quantity.toString(),
    unit: productInfo.unit,
    isOrganic: productInfo.isOrganic,
    isActive: productInfo.isActive
  });

  // Set listing parameters
  const price = productInfo.price; // Use the price from NFT metadata
  const quantity = 1; // List 1 NFT
  const expiryTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now

  console.log("📝 Creating listing...");
  console.log("Token ID:", latestTokenId.toString());
  console.log("Price:", ethers.formatEther(price), "AGRI tokens");
  console.log("Quantity:", quantity);
  console.log("Expiry time:", new Date(expiryTime * 1000).toISOString());

  // Create listing
  const tx = await marketplaceContract.listProduct(
    latestTokenId,
    price,
    quantity,
    expiryTime
  );

  console.log("📝 Listing transaction sent:", tx.hash);

  // Wait for confirmation
  const receipt = await tx.wait();
  console.log("✅ Listing confirmed:", receipt.hash);

  // Get listing ID from event
  const event = receipt.logs.find(log => {
    try {
      const parsed = marketplaceContract.interface.parseLog(log);
      return parsed?.name === 'ProductListed';
    } catch {
      return false;
    }
  });

  if (event) {
    const parsedEvent = marketplaceContract.interface.parseLog(event);
    const listingId = parsedEvent?.args[0];
    console.log("🎉 Product listed with ID:", listingId.toString());
    console.log("📋 Listing details:");
    console.log("  - Token ID:", parsedEvent?.args[1].toString());
    console.log("  - Supplier:", parsedEvent?.args[2]);
    console.log("  - Price:", ethers.formatEther(parsedEvent?.args[3]), "AGRI tokens");
    console.log("  - Quantity:", parsedEvent?.args[4].toString());
    console.log("  - Expiry:", new Date(Number(parsedEvent?.args[5]) * 1000).toISOString());
    
    console.log("\n🎯 Now you can buy this NFT using listing ID:", listingId.toString());
  }

  console.log("🎉 Product successfully listed on marketplace!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
