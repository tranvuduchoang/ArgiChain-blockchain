const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 Checking buyer balance...');
  
  const buyerAddress = '0xDE800c6278D82813AFd5104c365693C19B82F206';
  const tokenAddress = '0x76f84A7626914a3c762ff36518AdAFE16E30171b';
  
  // Get token contract
  const token = await ethers.getContractAt('AgriChainToken', tokenAddress);
  
  // Check buyer's balance
  const balance = await token.balanceOf(buyerAddress);
  console.log('Buyer AGRI balance:', ethers.formatEther(balance), 'AGRI');
  
  // Check if buyer has enough for 0.001 AGRI
  const requiredAmount = ethers.parseEther('0.001');
  console.log('Required amount:', ethers.formatEther(requiredAmount), 'AGRI');
  console.log('Has enough:', balance >= requiredAmount);
  
  // Try to transfer 1 AGRI to buyer
  const [supplier] = await ethers.getSigners();
  console.log('Supplier address:', supplier.address);
  
  const supplierBalance = await token.balanceOf(supplier.address);
  console.log('Supplier AGRI balance:', ethers.formatEther(supplierBalance), 'AGRI');
  
  if (supplierBalance >= ethers.parseEther('1')) {
    console.log('Transferring 1 AGRI to buyer...');
    const tx = await token.transfer(buyerAddress, ethers.parseEther('1'));
    await tx.wait();
    console.log('Transfer completed');
    
    const newBalance = await token.balanceOf(buyerAddress);
    console.log('Buyer new balance:', ethers.formatEther(newBalance), 'AGRI');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
