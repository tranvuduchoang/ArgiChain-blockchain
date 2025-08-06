# AgriChain Blockchain

Smart contracts for AgriChain - Blockchain-based Agricultural Marketplace built with Solidity, Hardhat, and OpenZeppelin.

## 🚀 Features

- **ERC-20 Token (AgriChainToken)**: Payment token with loyalty points system
- **ERC-1155 NFT (AgriChainNFT)**: Product representation and certificates
- **Marketplace Contract**: Complete marketplace with listings, auctions, and escrow
- **Security Features**: Reentrancy protection, access control, pausable functions
- **Gas Optimization**: Optimized for Polygon network

## 🛠️ Tech Stack

- **Solidity**: ^0.8.24
- **Hardhat**: Development framework
- **OpenZeppelin**: Secure contract libraries
- **TypeScript**: Type-safe development
- **Polygon**: Target blockchain network

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Compile contracts**
   ```bash
   npm run compile
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Private key of the account that will deploy the contracts
# WARNING: Never commit your private key to version control
PRIVATE_KEY=your_private_key_here

# RPC URLs
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
CARDONA_RPC_URL=https://rpc.cardona.zkevm-rpc.com

# API Keys for contract verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Gas reporting
REPORT_GAS=true

# Network to deploy to (mumbai, cardona, or hardhat)
DEPLOY_NETWORK=cardona
```

### Networks

- **Mumbai**: Polygon Mumbai testnet (Chain ID: 80001)
- **Cardona**: Polygon zkEVM Cardona testnet (Chain ID: 2442)
- **Hardhat**: Local development network (Chain ID: 1337)

## 📁 Contract Architecture

### 1. AgriChainToken (ERC-20)

**Purpose**: Payment token and loyalty points system

**Key Features**:
- Standard ERC-20 functionality
- Loyalty points system
- Supplier reward mechanism
- Authorized minter system
- Pausable for emergencies

**Main Functions**:
- `mint()`: Mint new tokens (authorized only)
- `addLoyaltyPoints()`: Add loyalty points to users
- `redeemLoyaltyPoints()`: Convert points to tokens
- `setupLoyaltyProgram()`: Configure supplier loyalty programs
- `rewardSupplier()`: Reward suppliers with tokens

### 2. AgriChainNFT (ERC-1155)

**Purpose**: Product representation and certificates

**Key Features**:
- ERC-1155 multi-token standard
- Product metadata storage
- Supplier authorization system
- Metadata update functionality
- Batch operations support

**Main Functions**:
- `mintProductNFT()`: Create NFT for product
- `burnProductNFT()`: Burn NFT when product sold
- `updateMetadata()`: Update product information
- `authorizeSupplier()`: Grant supplier permissions
- `getProductInfo()`: Retrieve product details

### 3. AgriChainMarketplace

**Purpose**: Complete marketplace functionality

**Key Features**:
- Product listings and sales
- Auction and bidding system
- Escrow payment handling
- Dispute resolution
- Order management

**Main Functions**:
- `listProduct()`: Create product listing
- `buyProduct()`: Purchase product
- `createAuction()`: Start auction
- `placeBid()`: Bid on auction
- `confirmDelivery()`: Confirm order delivery
- `raiseDispute()`: Raise order dispute

## 🚀 Deployment

### Local Development

1. **Start local node**
   ```bash
   npm run node
   ```

2. **Deploy to local network**
   ```bash
   npm run deploy:local
   ```

### Testnet Deployment

1. **Deploy to Mumbai testnet**
   ```bash
   npm run deploy:mumbai
   ```

2. **Deploy to Cardona testnet**
   ```bash
   npm run deploy:cardona
   ```

### Contract Verification

1. **Verify on Polygonscan (Mumbai)**
   ```bash
   npm run verify:mumbai
   ```

2. **Verify on Polygonscan (Cardona)**
   ```bash
   npm run verify:cardona
   ```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Gas Usage Report
```bash
npm run gas
```

## 📊 Contract Addresses

After deployment, you'll get contract addresses like:

```
AgriChainToken: 0x...
AgriChainNFT: 0x...
AgriChainMarketplace: 0x...
```

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for admin functions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive parameter checks
- **Safe Math**: Built-in overflow protection (Solidity 0.8+)

## 💰 Tokenomics

### AgriChainToken (AGRI)
- **Initial Supply**: 1,000,000 AGRI
- **Max Supply**: 10,000,000 AGRI
- **Decimals**: 18
- **Platform Fee**: 2.5% (configurable)

### Loyalty Points
- **Earning**: Points earned per purchase
- **Redemption**: Convert points to AGRI tokens
- **Expiry**: Configurable expiration time

## 🔄 Workflow

### For Suppliers
1. Get authorized as supplier
2. Mint product NFTs
3. List products for sale
4. Create auctions (optional)
5. Receive payments
6. Earn loyalty points

### For Buyers
1. Connect wallet
2. Browse products
3. Purchase with AGRI tokens
4. Receive product NFTs
5. Confirm delivery
6. Earn loyalty points

### For Marketplace
1. Handle escrow payments
2. Manage platform fees
3. Process disputes
4. Track orders
5. Manage auctions

## 🛠️ Development

### Compile Contracts
```bash
npm run compile
```

### Clean Build
```bash
npm run clean
```

### Contract Size Check
```bash
npm run size
```

### Flatten Contracts
```bash
npm run flatten
```

## 🔍 Monitoring

### Events to Monitor
- `ProductListed`: New product listed
- `ProductSold`: Product purchased
- `AuctionCreated`: New auction started
- `BidPlaced`: New bid placed
- `DisputeRaised`: Order dispute raised
- `LoyaltyPointsAdded`: Points awarded

### Important Addresses
- Contract owner
- Authorized suppliers
- Platform fee recipient
- Emergency pause controller

## 🚨 Emergency Procedures

### Pause Contracts
```solidity
// Pause token transfers
agriToken.pause();

// Pause NFT transfers
agriNFT.pause();

// Pause marketplace
marketplace.pause();
```

### Unpause Contracts
```solidity
// Resume operations
agriToken.unpause();
agriNFT.unpause();
marketplace.unpause();
```

## 📚 API Integration

### Frontend Integration
```javascript
// Connect to contracts
const agriToken = new ethers.Contract(tokenAddress, tokenABI, signer);
const agriNFT = new ethers.Contract(nftAddress, nftABI, signer);
const marketplace = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);
```

### Backend Integration
```javascript
// Listen to events
marketplace.on('ProductSold', (listingId, tokenId, buyer, supplier, quantity, totalPrice) => {
  // Update database
});
```

## 🔮 Future Enhancements

- [ ] Multi-signature wallet integration
- [ ] Advanced dispute resolution
- [ ] Automated price discovery
- [ ] Cross-chain bridge support
- [ ] Mobile wallet integration
- [ ] Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**AgriChain Blockchain** - Powering the future of agricultural commerce on blockchain 🌱
