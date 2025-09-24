const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Debugging listing 3...');
  
  // Get contract addresses
  const marketplaceAddress = process.env.AGRICHAIN_MARKETPLACE_ADDRESS || '0xf88559b87f94FF07c6c4297E7D04ab10573e9d62';
  
  // Get marketplace contract
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  
  const listingId = 3;
  
  console.log('📋 Getting listing details...');
  const listing = await marketplace.listings(listingId);
  
  console.log('Raw listing data:');
  console.log('  - tokenId:', listing[0].toString());
  console.log('  - supplier:', listing[1]);
  console.log('  - price:', listing[2].toString());
  console.log('  - quantity:', listing[3].toString());
  console.log('  - remainingQuantity:', listing[4].toString());
  console.log('  - expiryTime:', listing[5].toString());
  console.log('  - isActive:', listing[6]);
  
  console.log('\nFormatted data:');
  console.log('  - Price in wei:', listing[2].toString());
  console.log('  - Price in ether:', ethers.formatEther(listing[2]));
  console.log('  - Expected price (0.001):', ethers.formatEther(ethers.parseEther('0.001')));
  
  // Check if price is correct
  const expectedPrice = ethers.parseEther('0.001');
  const isCorrect = listing[2].toString() === expectedPrice.toString();
  console.log('  - Price is correct:', isCorrect);
  
  if (!isCorrect) {
    console.log('❌ Price is incorrect!');
    console.log('Expected:', expectedPrice.toString());
    console.log('Actual:', listing[2].toString());
  } else {
    console.log('✅ Price is correct!');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
