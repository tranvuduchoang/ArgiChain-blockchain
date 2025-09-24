const { ethers } = require('hardhat');

async function main() {
  console.log('🧪 Testing with buyer account...');
  
  const buyerAddress = '0xDE800c6278D82813AFd5104c365693C19B82F206';
  const marketplaceAddress = '0xF081DD1D2b30937c3c4c75728bBaA284407dDFCF';
  const tokenAddress = '0x76f84A7626914a3c762ff36518AdAFE16E30171b';
  
  // Get contracts
  const marketplace = await ethers.getContractAt('AgriChainMarketplace', marketplaceAddress);
  const token = await ethers.getContractAt('AgriChainToken', tokenAddress);
  
  // We need to use a different account that's not the supplier
  // Let's create a new account for testing
  const wallet = ethers.Wallet.createRandom();
  const testBuyer = wallet.connect(ethers.provider);
  
  console.log('Test buyer address:', testBuyer.address);
  console.log('Original buyer address:', buyerAddress);
  
  // Check if test buyer is the supplier
  const listing = await marketplace.listings(1);
  const supplier = listing[2];
  console.log('Supplier address:', supplier);
  console.log('Is test buyer the supplier:', testBuyer.address.toLowerCase() === supplier.toLowerCase());
  
  // Check test buyer's token balance
  const testBuyerBalance = await token.balanceOf(testBuyer.address);
  console.log('Test buyer token balance:', ethers.formatEther(testBuyerBalance), 'AGRI');
  
  if (testBuyerBalance == 0) {
    console.log('❌ Test buyer has no tokens. Need to transfer some tokens first.');
    
    // Transfer some tokens from deployer to test buyer
    const [deployer] = await ethers.getSigners();
    const transferTx = await token.transfer(testBuyer.address, ethers.parseEther('1'));
    await transferTx.wait();
    console.log('✅ Transferred 1 AGRI to test buyer');
    
    const newBalance = await token.balanceOf(testBuyer.address);
    console.log('Test buyer new balance:', ethers.formatEther(newBalance), 'AGRI');
  }
  
  // Now try to buy product
  try {
    const quantity = 1;
    const totalPrice = listing[3] * BigInt(quantity);
    console.log('Total price:', ethers.formatEther(totalPrice), 'AGRI');
    
    // Approve tokens
    console.log('✅ Approving tokens...');
    const approveTx = await token.connect(testBuyer).approve(marketplaceAddress, totalPrice);
    await approveTx.wait();
    console.log('✅ Tokens approved');
    
    // Try to buy product
    console.log('🛒 Buying product...');
    const buyTx = await marketplace.connect(testBuyer).buyProduct(1, quantity);
    console.log('📝 Buy transaction sent:', buyTx.hash);
    
    const receipt = await buyTx.wait();
    console.log('✅ Buy transaction confirmed:', receipt.hash);
    
    // Check if NFT was transferred
    const nftAddress = '0x0124b7D07Ebd0E9EDaACCdD126375671c3506f70';
    const nft = await ethers.getContractAt('AgriChainNFT', nftAddress);
    const nftBalance = await nft.balanceOf(testBuyer.address, 1);
    console.log('Test buyer NFT balance after purchase:', nftBalance.toString());
    
  } catch (error) {
    console.error('❌ Error during buyProduct:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
