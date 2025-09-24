const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Checking all listings...');
  
  // Get contract addresses
  const marketplaceAddress = process.env.AGRICHAIN_MARKETPLACE_ADDRESS || '0xf88559b87f94FF07c6c4297E7D04ab10573e9d62';
  
  // Get marketplace contract
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  
  // Check each listing (try up to 10)
  for (let i = 0; i < 10; i++) {
    console.log(`\n📋 Listing ${i}:`);
    try {
      const listing = await marketplace.listings(i);
      console.log('  - tokenId:', listing[0].toString());
      console.log('  - supplier:', listing[1]);
      console.log('  - price:', listing[2].toString());
      console.log('  - quantity:', listing[3].toString());
      console.log('  - remainingQuantity:', listing[4].toString());
      console.log('  - expiryTime:', listing[5].toString());
      console.log('  - isActive:', listing[6]);
      
      // Check if this looks like a valid listing
      const priceInEther = ethers.formatEther(listing[2]);
      console.log('  - price in ether:', priceInEther);
      
      // Check if price is reasonable (should be around 0.001)
      const expectedPrice = ethers.parseEther('0.001');
      const isReasonable = listing[2] <= expectedPrice * BigInt(10); // Allow up to 10x
      console.log('  - price is reasonable:', isReasonable);
      
    } catch (error) {
      console.log('  - Error reading listing:', error.message);
    }
  }
  
  console.log('\n🎯 Summary:');
  console.log('Checked listings 0-9');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
