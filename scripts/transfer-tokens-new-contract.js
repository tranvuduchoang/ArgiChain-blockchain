const { ethers } = require('hardhat');

async function main() {
  console.log('💰 Transferring AGRI tokens to buyer with new contract...');
  
  // Get accounts
  const [supplier] = await ethers.getSigners();
  const buyerAddress = '0xDE800c6278D82813AFd5104c365693C19B82F206'; // Buyer's actual address
  console.log('Supplier address:', supplier.address);
  console.log('Buyer address:', buyerAddress);
  
  // Get contract addresses from new deployment
  const tokenAddress = '0x76f84A7626914a3c762ff36518AdAFE16E30171b';
  
  console.log('Token contract address:', tokenAddress);
  
  // Get token contract
  const token = await ethers.getContractAt('AgriChainToken', tokenAddress);
  
  // Check supplier's token balance
  const supplierBalance = await token.balanceOf(supplier.address);
  console.log('Supplier AGRI balance:', ethers.formatEther(supplierBalance), 'AGRI');
  
  // Check buyer's token balance
  const buyerBalance = await token.balanceOf(buyerAddress);
  console.log('Buyer AGRI balance before:', ethers.formatEther(buyerBalance), 'AGRI');
  
  // Transfer 10 AGRI tokens to buyer
  const transferAmount = ethers.parseEther('10'); // 10 AGRI tokens
  console.log('Transferring', ethers.formatEther(transferAmount), 'AGRI tokens to buyer...');
  
  const tx = await token.transfer(buyerAddress, transferAmount);
  console.log('📝 Transfer transaction sent:', tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log('✅ Transfer confirmed:', receipt.hash);
  
  // Check buyer's balance after transfer
  const buyerBalanceAfter = await token.balanceOf(buyerAddress);
  console.log('Buyer AGRI balance after:', ethers.formatEther(buyerBalanceAfter), 'AGRI');
  
  console.log('🎉 AGRI tokens transferred successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
