const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying fresh contracts...');
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address:', deployer.address);
  console.log('Deployer balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'tBNB');
  
  // Deploy AgriChainToken
  console.log('\n💰 Deploying AgriChainToken...');
  const AgriChainToken = await ethers.getContractFactory('AgriChainToken');
  const token = await AgriChainToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log('✅ AgriChainToken deployed to:', tokenAddress);
  
  // Deploy AgriChainNFT
  console.log('\n🎨 Deploying AgriChainNFT...');
  const AgriChainNFT = await ethers.getContractFactory('AgriChainNFT');
  const nft = await AgriChainNFT.deploy(
    'https://api.agricchain.com/metadata/',
    'https://api.agricchain.com/contract-metadata'
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log('✅ AgriChainNFT deployed to:', nftAddress);
  
  // Deploy AgriChainMarketplace
  console.log('\n🏪 Deploying AgriChainMarketplace...');
  const AgriChainMarketplace = await ethers.getContractFactory('AgriChainMarketplace');
  const marketplace = await AgriChainMarketplace.deploy(tokenAddress, nftAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log('✅ AgriChainMarketplace deployed to:', marketplaceAddress);
  
  // Authorize deployer as supplier
  console.log('\n👤 Authorizing deployer as supplier...');
  const authorizeTx = await nft.authorizeSupplier(deployer.address);
  await authorizeTx.wait();
  console.log('✅ Deployer authorized as supplier');
  
  // Mint some tokens to deployer
  console.log('\n💰 Minting tokens to deployer...');
  const mintTx = await token.mint(deployer.address, ethers.parseEther('1000000'));
  await mintTx.wait();
  console.log('✅ Tokens minted to deployer');
  
  // Create a test listing
  console.log('\n📝 Creating test listing...');
  const price = ethers.parseEther('0.001'); // 0.001 AGRI tokens
  const quantity = 1;
  const expiryTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
  
  // First mint an NFT using the correct function signature
  const mintNftTx = await nft.mintProductNFT(
    1, // amount
    'Test Product', // name
    'Test Description', // description
    'VEGETABLES', // category
    ethers.parseEther('0.001'), // price
    1, // quantity
    'kg', // unit
    true, // isOrganic
    Math.floor(Date.now() / 1000), // harvestDate
    'Test Location', // location
    'https://api.agricchain.com/metadata/1' // metadata
  );
  await mintNftTx.wait();
  console.log('✅ NFT minted');
  
  // Approve marketplace to transfer NFTs
  const approveTx = await nft.setApprovalForAll(marketplaceAddress, true);
  await approveTx.wait();
  console.log('✅ Marketplace approved for NFT transfers');
  
  // Create listing
  const listTx = await marketplace.listProduct(1, price, quantity, expiryTime);
  const listReceipt = await listTx.wait();
  console.log('✅ Product listed');
  
  // Get listing ID from event
  const event = listReceipt.logs.find(log => {
    try {
      const parsed = marketplace.interface.parseLog(log);
      return parsed?.name === 'ProductListed';
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsedEvent = marketplace.interface.parseLog(event);
    const listingId = parsedEvent?.args[0];
    console.log('🎯 Listing ID:', listingId.toString());
  }
  
  // Verify listing
  console.log('\n🔍 Verifying listing...');
  const listing = await marketplace.listings(1);
  console.log('Listing details:');
  console.log('  - tokenId:', listing[0].toString());
  console.log('  - supplier:', listing[1]);
  console.log('  - price:', listing[2].toString());
  console.log('  - price in ether:', ethers.formatEther(listing[2]));
  console.log('  - quantity:', listing[3].toString());
  console.log('  - remainingQuantity:', listing[4].toString());
  console.log('  - expiryTime:', listing[5].toString());
  console.log('  - isActive:', listing[6]);
  
  // Save deployment info
  const deploymentInfo = {
    network: 'bscTestnet',
    chainId: 97,
    deployer: deployer.address,
    contracts: {
      AgriChainToken: tokenAddress,
      AgriChainNFT: nftAddress,
      AgriChainMarketplace: marketplaceAddress
    },
    deployedAt: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\n💾 Deployment info saved to deployment-info.json');
  
  console.log('\n🎉 Fresh contracts deployed successfully!');
  console.log('\n📋 Contract Addresses:');
  console.log('Token:', tokenAddress);
  console.log('NFT:', nftAddress);
  console.log('Marketplace:', marketplaceAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
