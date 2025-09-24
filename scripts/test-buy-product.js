const { ethers } = require('hardhat');

async function main() {
  console.log('🛒 Testing buy product flow...');
  
  // Get accounts
  const [supplier, buyer] = await ethers.getSigners();
  console.log('Supplier address:', supplier.address);
  console.log('Buyer address:', buyer.address);
  
  // Get contract addresses
  const tokenAddress = process.env.AGRICHAIN_TOKEN_ADDRESS || '0x0a5123a377A87321975578ED3C8D3336eF67F28a';
  const nftAddress = process.env.AGRICHAIN_NFT_ADDRESS || '0x739ECFc4a3C66e1E0b14B4581C5dA3341586a4E4';
  const marketplaceAddress = process.env.AGRICHAIN_MARKETPLACE_ADDRESS || '0xf88559b87f94FF07c6c4297E7D04ab10573e9d62';
  
  // Get contracts
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  const nft = await ethers.getContractAt('AgriChainNFT', nftAddress);
  const token = await ethers.getContractAt('AgriChainToken', tokenAddress);
  
  const listingId = 2; // The listing we just created
  const quantity = 1;
  
  console.log('📋 Getting listing details...');
  const listing = await marketplace.listings(listingId);
  console.log('Listing details:', {
    tokenId: listing[0].toString(),
    supplier: listing[1],
    price: listing[2].toString(),
    quantity: listing[3].toString(),
    remainingQuantity: listing[4].toString(),
    expiryTime: listing[5].toString(),
    isActive: listing[6]
  });
  
  // Check buyer's token balance
  const buyerBalance = await token.balanceOf(buyer.address);
  console.log('Buyer token balance:', ethers.formatEther(buyerBalance), 'tokens');
  
  // Check buyer's NFT balance before purchase
  const nftBalanceBefore = await nft.balanceOf(buyer.address, listing[0]);
  console.log('Buyer NFT balance before:', nftBalanceBefore.toString());
  
  // Calculate total price
  const totalPrice = listing[2] * BigInt(quantity);
  console.log('Total price:', ethers.formatEther(totalPrice), 'tokens');
  
  if (buyerBalance < totalPrice) {
    console.log('❌ Insufficient token balance');
    return;
  }
  
  // Approve tokens for marketplace
  console.log('✅ Approving tokens...');
  const approveTx = await token.connect(buyer).approve(marketplaceAddress, totalPrice);
  await approveTx.wait();
  console.log('✅ Tokens approved');
  
  // Buy product
  console.log('🛒 Buying product...');
  const buyTx = await marketplace.connect(buyer).buyProduct(listingId, quantity);
  console.log('📝 Buy transaction sent:', buyTx.hash);
  
  // Wait for confirmation
  const receipt = await buyTx.wait();
  console.log('✅ Buy transaction confirmed:', receipt.hash);
  
  // Check for ProductSold event
  const event = receipt.logs.find(log => {
    try {
      const parsed = marketplace.interface.parseLog(log);
      return parsed?.name === 'ProductSold';
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsedEvent = marketplace.interface.parseLog(event);
    console.log('🎉 ProductSold event:', {
      listingId: parsedEvent?.args[0].toString(),
      tokenId: parsedEvent?.args[1].toString(),
      buyer: parsedEvent?.args[2],
      supplier: parsedEvent?.args[3],
      quantity: parsedEvent?.args[4].toString(),
      totalPrice: ethers.formatEther(parsedEvent?.args[5])
    });
  }
  
  // Check balances after purchase
  const nftBalanceAfter = await nft.balanceOf(buyer.address, listing[0]);
  console.log('Buyer NFT balance after:', nftBalanceAfter.toString());
  
  const supplierTokenBalance = await token.balanceOf(supplier.address);
  console.log('Supplier token balance after:', ethers.formatEther(supplierTokenBalance), 'tokens');
  
  // Check updated listing
  const updatedListing = await marketplace.listings(listingId);
  console.log('Updated listing remaining quantity:', updatedListing[4].toString());
  
  console.log('🎉 Buy product test completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
