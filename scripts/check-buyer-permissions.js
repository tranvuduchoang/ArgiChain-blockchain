const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Checking buyer permissions...');
  
  const buyerAddress = '0xDE800c6278D82813AFd5104c365693C19B82F206';
  const marketplaceAddress = '0xF081DD1D2b30937c3c4c75728bBaA284407dDFCF';
  const nftAddress = '0x0124b7D07Ebd0E9EDaACCdD126375671c3506f70';
  const tokenAddress = '0x76f84A7626914a3c762ff36518AdAFE16E30171b';
  
  // Get contracts
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  const nft = await ethers.getContractAt('AgriChainNFT', nftAddress);
  const token = await ethers.getContractAt('AgriChainToken', tokenAddress);
  
  console.log('Buyer address:', buyerAddress);
  console.log('Marketplace address:', marketplaceAddress);
  console.log('NFT address:', nftAddress);
  console.log('Token address:', tokenAddress);
  
  // Check if buyer is authorized supplier
  try {
    const isAuthorized = await nft.isAuthorizedSupplier(buyerAddress);
    console.log('Is buyer authorized supplier:', isAuthorized);
  } catch (error) {
    console.log('Error checking authorization:', error.message);
  }
  
  // Check buyer's token balance
  const tokenBalance = await token.balanceOf(buyerAddress);
  console.log('Buyer token balance:', ethers.formatEther(tokenBalance), 'AGRI');
  
  // Check buyer's NFT balance
  const nftBalance = await nft.balanceOf(buyerAddress, 1);
  console.log('Buyer NFT balance (tokenId=1):', nftBalance.toString());
  
  // Check listing details
  const listing = await marketplace.listings(1);
  console.log('Listing details:');
  console.log('  - listingId:', listing[0].toString());
  console.log('  - tokenId:', listing[1].toString());
  console.log('  - supplier:', listing[2]);
  console.log('  - price:', ethers.formatEther(listing[3]), 'AGRI');
  console.log('  - quantity:', listing[4].toString());
  console.log('  - remainingQuantity:', listing[5].toString());
  console.log('  - expiryTime:', listing[6].toString());
  console.log('  - isActive:', listing[7]);
  
  // Check if buyer has enough tokens
  const requiredAmount = listing[3] * BigInt(1); // For quantity 1
  console.log('Required amount:', ethers.formatEther(requiredAmount), 'AGRI');
  console.log('Has enough tokens:', tokenBalance >= requiredAmount);
  
  // Check if buyer is the supplier (should not be)
  console.log('Is buyer the supplier:', listing[2].toLowerCase() === buyerAddress.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
