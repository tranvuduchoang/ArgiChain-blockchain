const { ethers } = require('hardhat');

async function main() {
  console.log('💰 Checking listing price...');
  
  // Get contract addresses
  const marketplaceAddress = process.env.AGRICHAIN_MARKETPLACE_ADDRESS || '0xf88559b87f94FF07c6c4297E7D04ab10573e9d62';
  
  // Get marketplace contract
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  
  const listingId = 2; // The listing we created
  
  console.log('📋 Getting listing details...');
  const listing = await marketplace.listings(listingId);
  console.log('Listing details:', {
    tokenId: listing[0].toString(),
    supplier: listing[1],
    price: listing[2].toString(),
    priceInEther: ethers.formatEther(listing[2]),
    quantity: listing[3].toString(),
    remainingQuantity: listing[4].toString(),
    expiryTime: listing[5].toString(),
    isActive: listing[6]
  });
  
  // Calculate total price for 1 quantity
  const quantity = 1;
  const totalPrice = listing[2] * BigInt(quantity);
  console.log(`\n💰 Price calculation for ${quantity} item:`);
  console.log('Price per item:', ethers.formatEther(listing[2]), 'AGRI');
  console.log('Total price:', ethers.formatEther(totalPrice), 'AGRI');
  console.log('Total price in wei:', totalPrice.toString());
  
  // Check if price is reasonable (should be around 0.001 AGRI)
  const expectedPrice = ethers.parseEther('0.001');
  console.log('\n🔍 Price validation:');
  console.log('Expected price (0.001 AGRI):', ethers.formatEther(expectedPrice));
  console.log('Actual price:', ethers.formatEther(listing[2]));
  const isReasonable = listing[2] <= expectedPrice * BigInt(10);
  console.log('Price is reasonable:', isReasonable); // Allow up to 10x expected price
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
