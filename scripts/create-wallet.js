const { ethers } = require('ethers');

async function main() {
  console.log("🎲 Generating new wallet...");
  
  // Create a new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log("✅ New wallet created!");
  console.log("=" .repeat(60));
  console.log("📍 Address:", wallet.address);
  console.log("🔑 Private Key:", wallet.privateKey);
  console.log("🌱 Mnemonic:", wallet.mnemonic.phrase);
  console.log("=" .repeat(60));
  
  console.log("\n⚠️  SECURITY WARNING:");
  console.log("1. Never share your private key with anyone");
  console.log("2. Never commit your private key to version control");
  console.log("3. Store your mnemonic phrase in a secure location");
  
  console.log("\n📝 Next steps:");
  console.log("1. Copy the private key above");
  console.log("2. Add it to your .env file as PRIVATE_KEY=");
  console.log("3. Fund this address with test ETH from faucet");
  console.log("4. Run deployment script");
  
  console.log("\n🚰 Faucet Links:");
  console.log("Cardona zkEVM: https://bridge.cardona.zkevm-rpc.com/");
  console.log("Mumbai: https://faucet.polygon.technology/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });