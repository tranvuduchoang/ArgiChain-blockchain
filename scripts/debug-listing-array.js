const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Debugging listing array structure...');
  
  // Get contract addresses
  const marketplaceAddress = '0xF081DD1D2b30937c3c4c75728bBaA284407dDFCF';
  
  // Get marketplace contract
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  
  const listingId = 1;
  
  console.log('📋 Getting listing details...');
  const listing = await marketplace.listings(listingId);
  
  console.log('Raw listing data:');
  console.log('Array length:', listing.length);
  console.log('Type:', typeof listing);
  
  for (let i = 0; i < listing.length; i++) {
    console.log(`  [${i}]:`, listing[i].toString());
  }
  
  console.log('\nChecking array bounds:');
  console.log('listing[0] exists:', listing[0] !== undefined);
  console.log('listing[1] exists:', listing[1] !== undefined);
  console.log('listing[2] exists:', listing[2] !== undefined);
  console.log('listing[3] exists:', listing[3] !== undefined);
  console.log('listing[4] exists:', listing[4] !== undefined);
  console.log('listing[5] exists:', listing[5] !== undefined);
  console.log('listing[6] exists:', listing[6] !== undefined);
  console.log('listing[7] exists:', listing[7] !== undefined);
  console.log('listing[8] exists:', listing[8] !== undefined);
  
  // Test safe access
  console.log('\nSafe access test:');
  try {
    const tokenId = listing[1] ? listing[1].toString() : 'undefined';
    const supplier = listing[2] || 'undefined';
    const price = listing[3] ? listing[3].toString() : 'undefined';
    console.log('Safe access successful:', { tokenId, supplier, price });
  } catch (error) {
    console.error('Safe access failed:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
