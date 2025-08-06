import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgriChainMarketplace", function () {
  let marketplace: any;
  let agriToken: any;
  let agriNFT: any;
  let owner: any, supplier: any, buyer: any, bidder: any;

  beforeEach(async function () {
    [owner, supplier, buyer, bidder] = await ethers.getSigners();

    // Deploy AgriChainToken
    const AgriToken = await ethers.getContractFactory("AgriChainToken");
    agriToken = await AgriToken.deploy();

    // Deploy AgriChainNFT (cần truyền baseURI và contractURI)
    const AgriNFT = await ethers.getContractFactory("AgriChainNFT");
    agriNFT = await AgriNFT.deploy("", "");

    // Authorize supplier
    await agriNFT.connect(owner).authorizeSupplier(supplier.address);

    // Mint NFT to supplier (tokenId sẽ là 1)
    await agriNFT.connect(supplier).mintProductNFT(
      100, // amount
      "Rice", // name
      "High quality rice", // description
      "Grain", // category
      1000, // price
      100, // quantity
      "kg", // unit
      true, // isOrganic
      Math.floor(Date.now() / 1000), // harvestDate
      "Vietnam", // location
      "meta1" // metadata
    );

    // Owner setup loyalty program cho supplier
    await agriToken.connect(owner).setupLoyaltyProgram(1, 1);

    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("AgriChainMarketplace");
    marketplace = await Marketplace.deploy(agriToken.address, agriNFT.address);

    // Mint tokens cho buyer và bidder (owner là authorized minter)
    await agriToken.connect(owner).mint(buyer.address, 100000);
    await agriToken.connect(owner).mint(bidder.address, 100000);
    // Approve marketplace
    await agriToken.connect(buyer).approve(marketplace.address, 100000);
    await agriToken.connect(bidder).approve(marketplace.address, 100000);
  });

  it("should allow supplier to list a product", async function () {
    await expect(
      marketplace.connect(supplier).listProduct(1, 1000, 10, Math.floor(Date.now() / 1000) + 3600)
    ).to.emit(marketplace, "ProductListed");
  });

  it("should allow buyer to buy a product", async function () {
    await marketplace.connect(supplier).listProduct(1, 1000, 10, Math.floor(Date.now() / 1000) + 3600);
    await expect(
      marketplace.connect(buyer).buyProduct(1, 2)
    ).to.emit(marketplace, "ProductSold");
  });

  it("should allow supplier to create an auction", async function () {
    await expect(
      marketplace.connect(supplier).createAuction(1, 500, 3600, 5)
    ).to.emit(marketplace, "AuctionCreated");
  });

  it("should allow bidder to place a bid and end auction", async function () {
    await marketplace.connect(supplier).createAuction(1, 500, 1, 5);
    await marketplace.connect(bidder).placeBid(1, 600);
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine", []);
    await expect(
      marketplace.connect(supplier).endAuction(1)
    ).to.emit(marketplace, "AuctionEnded");
  });
});
