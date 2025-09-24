const { ethers } = require('hardhat');

async function main() {
  console.log('💰 Minting AGRI tokens for buyer...');
  
  // Get accounts
  const [supplier] = await ethers.getSigners();
  const buyerAddress = '0xDE800c6278D82813AFd5104c365693C19B82F206'; // Buyer's actual address
  console.log('Supplier address:', supplier.address);
  console.log('Buyer address:', buyerAddress);
  
  // Get contract addresses
  const tokenAddress = process.env.AGRICHAIN_TOKEN_ADDRESS || '0x0a5123a377A87321975578ED3C8D3336eF67F28a';
  
  console.log('Token contract address:', tokenAddress);
  
  // Get token contract
  const token = await ethers.getContractAt('AgriChainToken', tokenAddress);
  
  // Check supplier's token balance
  const supplierBalance = await token.balanceOf(supplier.address);
  console.log('Supplier AGRI balance:', ethers.formatEther(supplierBalance), 'AGRI');
  
  // Check buyer's token balance
  const buyerBalance = await token.balanceOf(buyerAddress);
  console.log('Buyer AGRI balance before:', ethers.formatEther(buyerBalance), 'AGRI');
  
  // Mint 10 AGRI tokens to buyer
  const mintAmount = ethers.parseEther('10'); // 10 AGRI tokens
  console.log('Minting', ethers.formatEther(mintAmount), 'AGRI tokens to buyer...');
  
  // Transfer from supplier to buyer
  if (supplierBalance >= mintAmount) {
    console.log('🔄 Transferring tokens from supplier to buyer...');
    const tx = await token.transfer(buyerAddress, mintAmount);
    console.log('📝 Transfer transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Transfer confirmed:', receipt.hash);
    
    const buyerBalanceAfter = await token.balanceOf(buyerAddress);
    console.log('Buyer AGRI balance after:', ethers.formatEther(buyerBalanceAfter), 'AGRI');
    
    console.log('🎉 AGRI tokens transferred successfully!');
  } else {
    console.log('❌ Supplier does not have enough tokens');
    console.log('Supplier balance:', ethers.formatEther(supplierBalance), 'AGRI');
    console.log('Required amount:', ethers.formatEther(mintAmount), 'AGRI');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
