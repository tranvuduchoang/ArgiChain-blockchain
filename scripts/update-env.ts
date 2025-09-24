import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log("📝 Updating .env files with deployed contract addresses...");

  try {
    // Read deployment info
    const deploymentInfo = JSON.parse(readFileSync('deployment-info.json', 'utf8'));
    
    const { contracts } = deploymentInfo;
    
    // Update blockchain .env
    const blockchainEnvPath = join(__dirname, '..', '.env');
    let blockchainEnv = '';
    
    try {
      blockchainEnv = readFileSync(blockchainEnvPath, 'utf8');
    } catch (error) {
      // Create new .env file
      blockchainEnv = `# Private key of the account that will deploy the contracts
PRIVATE_KEY=your_private_key_here

# RPC URLs
BNBTESTNET_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BSC_CHAIN_ID=97

# API Keys for contract verification
BSCSCAN_API_KEY=your_bscscan_api_key_here

# Deployed contract addresses
AGRICHAIN_TOKEN_ADDRESS=
AGRICHAIN_NFT_ADDRESS=
AGRICHAIN_MARKETPLACE_ADDRESS=

# NFT metadata
NFT_BASE_URI=https://metadata.agrichain.com/nft/
CONTRACT_URI=https://metadata.agrichain.com/contract.json

# Gas reporting
REPORT_GAS=true
`;
    }

    // Update contract addresses
    blockchainEnv = blockchainEnv.replace(
      /AGRICHAIN_TOKEN_ADDRESS=.*/,
      `AGRICHAIN_TOKEN_ADDRESS=${contracts.AgriChainToken}`
    );
    blockchainEnv = blockchainEnv.replace(
      /AGRICHAIN_NFT_ADDRESS=.*/,
      `AGRICHAIN_NFT_ADDRESS=${contracts.AgriChainNFT}`
    );
    blockchainEnv = blockchainEnv.replace(
      /AGRICHAIN_MARKETPLACE_ADDRESS=.*/,
      `AGRICHAIN_MARKETPLACE_ADDRESS=${contracts.AgriChainMarketplace}`
    );

    writeFileSync(blockchainEnvPath, blockchainEnv);
    console.log("✅ Updated blockchain/.env");

    // Update backend .env
    const backendEnvPath = join(__dirname, '..', '..', 'backend', '.env');
    let backendEnv = '';
    
    try {
      backendEnv = readFileSync(backendEnvPath, 'utf8');
    } catch (error) {
      // Create new .env file
      backendEnv = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/agrichain"

# Blockchain
BNBTESTNET_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BSC_CHAIN_ID=97
BLOCKCHAIN_NETWORK=bsctestnet
BLOCKCHAIN_DEPLOYER_KEY=your_private_key_here
NFT_BASE_URI=https://metadata.agrichain.com/nft/

# Contract addresses
AGRICHAIN_TOKEN_ADDRESS=
AGRICHAIN_NFT_ADDRESS=
AGRICHAIN_MARKETPLACE_ADDRESS=

# JWT
JWT_SECRET=your_jwt_secret_here

# Server
PORT=5000
NODE_ENV=development
`;
    }

    // Update contract addresses
    backendEnv = backendEnv.replace(
      /AGRICHAIN_TOKEN_ADDRESS=.*/,
      `AGRICHAIN_TOKEN_ADDRESS=${contracts.AgriChainToken}`
    );
    backendEnv = backendEnv.replace(
      /AGRICHAIN_NFT_ADDRESS=.*/,
      `AGRICHAIN_NFT_ADDRESS=${contracts.AgriChainNFT}`
    );
    backendEnv = backendEnv.replace(
      /AGRICHAIN_MARKETPLACE_ADDRESS=.*/,
      `AGRICHAIN_MARKETPLACE_ADDRESS=${contracts.AgriChainMarketplace}`
    );

    writeFileSync(backendEnvPath, backendEnv);
    console.log("✅ Updated backend/.env");

    // Update frontend .env.local
    const frontendEnvPath = join(__dirname, '..', '..', 'frontend', '.env.local');
    let frontendEnv = '';
    
    try {
      frontendEnv = readFileSync(frontendEnvPath, 'utf8');
    } catch (error) {
      // Create new .env.local file
      frontendEnv = `# Contract addresses
NEXT_PUBLIC_AGRICHAIN_TOKEN_ADDRESS=
NEXT_PUBLIC_AGRICHAIN_NFT_ADDRESS=
NEXT_PUBLIC_AGRICHAIN_MARKETPLACE_ADDRESS=

# Blockchain
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_CHAIN_NAME=BSC Testnet
NEXT_PUBLIC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_EXPLORER_URL=https://testnet.bscscan.com
`;
    }

    // Update contract addresses
    frontendEnv = frontendEnv.replace(
      /NEXT_PUBLIC_AGRICHAIN_TOKEN_ADDRESS=.*/,
      `NEXT_PUBLIC_AGRICHAIN_TOKEN_ADDRESS=${contracts.AgriChainToken}`
    );
    frontendEnv = frontendEnv.replace(
      /NEXT_PUBLIC_AGRICHAIN_NFT_ADDRESS=.*/,
      `NEXT_PUBLIC_AGRICHAIN_NFT_ADDRESS=${contracts.AgriChainNFT}`
    );
    frontendEnv = frontendEnv.replace(
      /NEXT_PUBLIC_AGRICHAIN_MARKETPLACE_ADDRESS=.*/,
      `NEXT_PUBLIC_AGRICHAIN_MARKETPLACE_ADDRESS=${contracts.AgriChainMarketplace}`
    );

    writeFileSync(frontendEnvPath, frontendEnv);
    console.log("✅ Updated frontend/.env.local");

    console.log("\n🎉 All .env files updated successfully!");
    console.log("\n📋 Contract addresses:");
    console.log(`AgriChainToken: ${contracts.AgriChainToken}`);
    console.log(`AgriChainNFT: ${contracts.AgriChainNFT}`);
    console.log(`AgriChainMarketplace: ${contracts.AgriChainMarketplace}`);

  } catch (error) {
    console.error("❌ Error updating .env files:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
