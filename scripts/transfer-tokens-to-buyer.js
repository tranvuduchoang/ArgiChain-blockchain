const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Transferring tokens to buyer...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Buyer address from your error log
  const buyerAddress = "0xde800c6278082813afd5104c365693c19882f206";
  console.log("Buyer:", buyerAddress);

  // Get contract addresses
  const deploymentInfo = require("../deployment-info.json");
  const tokenAddress = deploymentInfo.contracts.AgriChainToken;

  // Get token contract
  const AgriChainToken = await ethers.getContractFactory("AgriChainToken");
  const tokenContract = AgriChainToken.attach(tokenAddress);

  // Check deployer's token balance
  const deployerBalance = await tokenContract.balanceOf(deployer.address);
  console.log("Deployer token balance:", ethers.formatEther(deployerBalance));

  // Transfer 10 tokens to buyer
  const transferAmount = ethers.parseEther("10");
  console.log("Transferring", ethers.formatEther(transferAmount), "tokens to buyer...");

  const tx = await tokenContract.transfer(buyerAddress, transferAmount);
  console.log("Transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Transfer confirmed in block:", receipt.blockNumber);

  // Check buyer's new balance
  const buyerBalance = await tokenContract.balanceOf(buyerAddress);
  console.log("Buyer new token balance:", ethers.formatEther(buyerBalance));

  console.log("🎉 Tokens transferred successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });