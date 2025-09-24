const { ethers } = require('hardhat');

async function main() {
  console.log('📋 Recreating listing with correct price...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address:', deployer.address);
  
  // Get contract addresses
  const tokenAddress = process.env.AGRICHAIN_TOKEN_ADDRESS || '0x0a5123a377A87321975578ED3C8D3336eF67F28a';
  const nftAddress = process.env.AGRICHAIN_NFT_ADDRESS || '0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4';
  const marketplaceAddress = process.env.AGRICHAIN_MARKETPLACE_ADDRESS || '0xf88559b87f94FF07c6c4297E7D04ab10573e9d62';
  
  // Get contracts
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  const nft = await ethers.getContractAt('AgriChainNFT', nftAddress);
  
  // Check if deployer is authorized supplier
  const isAuthorized = await nft.isAuthorizedSupplier(deployer.address);
  console.log('Is authorized supplier:', isAuthorized);
  
  if (!isAuthorized) {
    console.log('❌ Deployer is not authorized supplier');
    return;
  }
  
  // Check NFT balance
  const tokenId = 1; // Use token ID 1
  const balance = await nft.balanceOf(deployer.address, tokenId);
  console.log(`NFT balance for token ID ${tokenId}:`, balance.toString());
  
  if (balance == 0) {
    console.log('❌ No NFT balance. Please mint NFT first.');
    return;
  }
  
  // Set correct price (0.001 AGRI tokens = 1000000000000000 wei)
  const price = ethers.parseEther('0.001'); // 0.001 AGRI tokens
  const quantity = 1;
  const expiryTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now
  
  console.log('📝 Creating new listing...');
  console.log('Price:', ethers.formatEther(price), 'AGRI tokens');
  console.log('Quantity:', quantity);
  console.log('Expiry time:', new Date(expiryTime * 1000).toISOString());
  
  // Create listing
  const tx = await marketplace.listProduct(
    tokenId,
    price,
    quantity,
    expiryTime
  );
  
  console.log('📝 Listing transaction sent:', tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log('✅ Listing confirmed:', receipt.hash);
  
  // Get listing ID from event
  const event = receipt.logs.find(log => {
    try {
      const parsed = marketplace.interface.parseLog(log);
      return parsed?.name === 'ProductListed';
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsedEvent = marketplace.interface.parseLog(event);
    const listingId = parsedEvent?.args[0];
    console.log('🎉 Product listed with ID:', listingId.toString());
    console.log('📋 Listing details:');
    console.log('  - Token ID:', parsedEvent?.args[1].toString());
    console.log('  - Supplier:', parsedEvent?.args[2]);
    console.log('  - Price:', ethers.formatEther(parsedEvent?.args[3]), 'AGRI tokens');
    console.log('  - Quantity:', parsedEvent?.args[4].toString());
    console.log('  - Expiry:', new Date(Number(parsedEvent?.args[5]) * 1000).toISOString());
    
    console.log('\n🎯 Use this listing ID in frontend:', listingId.toString());
  }
  
  console.log('🎉 Product successfully listed on marketplace!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
