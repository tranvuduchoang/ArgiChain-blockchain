# AgriChain Blockchain Deployment Guide

## Setup để Deploy Contracts

### 1. Tạo Wallet và Lấy Private Key

**Cách 1: Sử dụng MetaMask**
1. Cài đặt MetaMask extension
2. Tạo wallet mới hoặc import existing wallet
3. Vào Settings > Security & Privacy > Export Private Key
4. Copy private key (bắt đầu với 0x...)

**Cách 2: Tạo wallet mới với Hardhat**
```bash
# Tạo wallet mới
npx hardhat run scripts/create-wallet.js
```

### 2. Cấu hình Environment Variables

Sửa file `.env`:
```bash
# Bỏ comment và thay thế bằng private key thật
PRIVATE_KEY=0x1234567890abcdef... # Your private key here

# RPC URLs (đã có sẵn)
CARDONA_RPC_URL=https://rpc.cardona.zkevm-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
```

### 3. Lấy Test ETH cho Cardona Network

**Cardona zkEVM Testnet:**
1. Vào: https://bridge.cardona.zkevm-rpc.com/
2. Connect wallet (MetaMask)
3. Request test ETH từ faucet
4. Hoặc bridge từ Sepolia testnet

**Mumbai Testnet:**
1. Vào: https://faucet.polygon.technology/
2. Paste address và request MATIC

### 4. Deploy Contracts

```bash
# Deploy lên Cardona
npm run deploy:cardona

# Deploy lên Mumbai  
npm run deploy:mumbai

npx hardhat run scripts/deploy.ts --network sepolia
# hoặc
npx hardhat run scripts/deploy.ts --network amoy

# Deploy locally (cho development)
npm run deploy:local
    npx hardhat run scripts/deploy.ts --network hardhat
```

### 5. Verify Deployment

Sau khi deploy thành công, bạn sẽ thấy:
- Contract addresses
- Transaction hashes
- Block explorer links

### Troubleshooting

**Error: "No signers available"**
- Kiểm tra PRIVATE_KEY trong .env file
- Đảm bảo private key không có comment (#)

**Error: "Insufficient balance"**  
- Account cần có ETH để trả gas fees
- Request test ETH từ faucet

**Error: "Cannot connect to network"**
- Kiểm tra RPC URL
- Thử với network khác

### Network Information

**Cardona zkEVM Testnet**
- Chain ID: 2442
- RPC: https://rpc.cardona.zkevm-rpc.com
- Explorer: https://explorer.cardona.zkevm-rpc.com

**Mumbai Testnet**  
- Chain ID: 80001
- RPC: https://rpc-mumbai.maticvigil.com
- Explorer: https://mumbai.polygonscan.com