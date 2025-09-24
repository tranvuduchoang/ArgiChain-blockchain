const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Debugging storage layout...');
  
  // Get contract addresses
  const marketplaceAddress = '0xF081DD1D2b30937c3c4c75728bBaA284407dDFCF';
  
  // Get marketplace contract
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  
  const listingId = 1;
  
  console.log('📋 Getting listing details...');
  const listing = await marketplace.listings(listingId);
  
  console.log('Raw listing data:');
  for (let i = 0; i < listing.length; i++) {
    console.log(`  [${i}]:`, listing[i].toString());
  }
  
  console.log('\nFormatted data:');
  console.log('  - listingId (index 0):', listing[0].toString());
  console.log('  - tokenId (index 1):', listing[1].toString());
  console.log('  - supplier (index 2):', listing[2]);
  console.log('  - price (index 3):', listing[3].toString());
  console.log('  - quantity (index 4):', listing[4].toString());
  console.log('  - remainingQuantity (index 5):', listing[5].toString());
  console.log('  - expiryTime (index 6):', listing[6].toString());
  console.log('  - isActive (index 7):', listing[7]);
  
  console.log('\nPrice analysis:');
  console.log('  - Price in wei:', listing[3].toString());
  console.log('  - Price in ether:', ethers.formatEther(listing[3]));
  console.log('  - Expected price (0.001):', ethers.formatEther(ethers.parseEther('0.001')));
  
  // Check if price is correct
  const expectedPrice = ethers.parseEther('0.001');
  const isCorrect = listing[3].toString() === expectedPrice.toString();
  console.log('  - Price is correct:', isCorrect);
  
  if (!isCorrect) {
    console.log('❌ Price is incorrect!');
    console.log('Expected:', expectedPrice.toString());
    console.log('Actual:', listing[3].toString());
    
    // Check if price field contains supplier address
    const supplierAddress = listing[2];
    console.log('Supplier address:', supplierAddress);
    console.log('Price field contains supplier address:', listing[3].toString() === supplierAddress);
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
