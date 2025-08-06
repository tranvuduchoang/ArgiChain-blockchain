// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./AgriChainToken.sol";
import "./AgriChainNFT.sol";

/**
 * @title AgriChainMarketplace
 * @dev Marketplace contract for agricultural products
 * This contract handles:
 * - Product listings
 * - Direct purchases
 * - Auctions and bidding
 * - Escrow payments
 * - Dispute resolution
 */
contract AgriChainMarketplace is ReentrancyGuard, Ownable, Pausable {
    // Events
    event ProductListed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed supplier,
        uint256 price,
        uint256 quantity,
        uint256 expiryTime
    );
    event ProductSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        address supplier,
        uint256 quantity,
        uint256 totalPrice
    );
    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed tokenId,
        address indexed supplier,
        uint256 startPrice,
        uint256 startTime,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );
    event DisputeRaised(
        uint256 indexed orderId,
        address indexed buyer,
        string reason
    );
    event DisputeResolved(
        uint256 indexed orderId,
        address indexed resolver,
        bool refundApproved
    );

    // Structs
    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address supplier;
        uint256 price;
        uint256 quantity;
        uint256 remainingQuantity;
        uint256 expiryTime;
        bool isActive;
    }

    struct Auction {
        uint256 auctionId;
        uint256 tokenId;
        address supplier;
        uint256 startPrice;
        uint256 currentPrice;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        bool isActive;
        uint256 quantity;
    }

    struct Order {
        uint256 orderId;
        uint256 listingId;
        address buyer;
        address supplier;
        uint256 quantity;
        uint256 totalPrice;
        uint256 status; // 0: Pending, 1: Paid, 2: Delivered, 3: Completed, 4: Disputed, 5: Cancelled
        uint256 createdAt;
        uint256 deliveryDeadline;
        bool isDisputed;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    // State variables
    uint256 private nextListingId = 1;
    uint256 private nextAuctionId = 1;
    uint256 private nextOrderId = 1;

    AgriChainToken public agriToken;
    AgriChainNFT public agriNFT;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => Bid[]) public auctionBids;
    mapping(address => uint256[]) public userOrders;
    mapping(address => uint256[]) public supplierOrders;

    uint256 public platformFee = 250; // 2.5% (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant DISPUTE_WINDOW = 7 days;
    uint256 public constant DELIVERY_WINDOW = 3 days;

    // Modifiers
    modifier onlySupplier() {
        require(agriNFT.isAuthorizedSupplier(msg.sender), "Not authorized supplier");
        _;
    }

    modifier listingExists(uint256 listingId) {
        require(listings[listingId].isActive, "Listing does not exist");
        _;
    }

    modifier auctionExists(uint256 auctionId) {
        require(auctions[auctionId].isActive, "Auction does not exist");
        _;
    }

    modifier orderExists(uint256 orderId) {
        require(orders[orderId].orderId != 0, "Order does not exist");
        _;
    }

    constructor(address _agriToken, address _agriNFT) Ownable(msg.sender) {
        agriToken = AgriChainToken(_agriToken);
        agriNFT = AgriChainNFT(_agriNFT);
    }

    /**
     * @dev List a product for sale
     * @param tokenId NFT token ID
     * @param price Price per unit in AGRI tokens
     * @param quantity Quantity available
     * @param expiryTime Listing expiry time
     */
    function listProduct(
        uint256 tokenId,
        uint256 price,
        uint256 quantity,
        uint256 expiryTime
    ) external onlySupplier nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(quantity > 0, "Quantity must be greater than 0");
        require(expiryTime > block.timestamp, "Expiry time must be in the future");
        require(agriNFT.balanceOf(msg.sender, tokenId) >= quantity, "Insufficient NFT balance");

        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
            listingId: listingId,
            tokenId: tokenId,
            supplier: msg.sender,
            price: price,
            quantity: quantity,
            remainingQuantity: quantity,
            expiryTime: expiryTime,
            isActive: true
        });

        emit ProductListed(listingId, tokenId, msg.sender, price, quantity, expiryTime);
    }

    /**
     * @dev Buy a product
     * @param listingId ID of the listing
     * @param quantity Quantity to buy
     */
    function buyProduct(uint256 listingId, uint256 quantity) 
        external 
        listingExists(listingId) 
        nonReentrant 
    {
        Listing storage listing = listings[listingId];
        require(block.timestamp <= listing.expiryTime, "Listing expired");
        require(quantity > 0, "Quantity must be greater than 0");
        require(quantity <= listing.remainingQuantity, "Insufficient quantity available");
        require(msg.sender != listing.supplier, "Cannot buy your own product");

        uint256 totalPrice = listing.price * quantity;
        uint256 platformFeeAmount = (totalPrice * platformFee) / BASIS_POINTS;
        uint256 supplierAmount = totalPrice - platformFeeAmount;

        // Transfer tokens from buyer to contract (escrow)
        require(
            agriToken.transferFrom(msg.sender, address(this), totalPrice),
            "Token transfer failed"
        );

        // Transfer platform fee to owner
        agriToken.transfer(owner(), platformFeeAmount);

        // Transfer remaining amount to supplier
        agriToken.transfer(listing.supplier, supplierAmount);

        // Transfer NFTs from supplier to buyer
        agriNFT.safeTransferFrom(listing.supplier, msg.sender, listing.tokenId, quantity, "");

        // Update listing
        listing.remainingQuantity -= quantity;
        if (listing.remainingQuantity == 0) {
            listing.isActive = false;
        }

        // Create order
        uint256 orderId = nextOrderId++;

        orders[orderId] = Order({
            orderId: orderId,
            listingId: listingId,
            buyer: msg.sender,
            supplier: listing.supplier,
            quantity: quantity,
            totalPrice: totalPrice,
            status: 1, // Paid
            createdAt: block.timestamp,
            deliveryDeadline: block.timestamp + DELIVERY_WINDOW,
            isDisputed: false
        });

        userOrders[msg.sender].push(orderId);
        supplierOrders[listing.supplier].push(orderId);

        // Add loyalty points to buyer
        agriToken.addLoyaltyPoints(msg.sender, quantity, "Purchase reward");

        emit ProductSold(listingId, listing.tokenId, msg.sender, listing.supplier, quantity, totalPrice);
    }

    /**
     * @dev Create an auction
     * @param tokenId NFT token ID
     * @param startPrice Starting price
     * @param duration Auction duration in seconds
     * @param quantity Quantity available
     */
    function createAuction(
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration,
        uint256 quantity
    ) external onlySupplier nonReentrant {
        require(startPrice > 0, "Start price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(quantity > 0, "Quantity must be greater than 0");
        require(agriNFT.balanceOf(msg.sender, tokenId) >= quantity, "Insufficient NFT balance");

        uint256 auctionId = nextAuctionId++;

        auctions[auctionId] = Auction({
            auctionId: auctionId,
            tokenId: tokenId,
            supplier: msg.sender,
            startPrice: startPrice,
            currentPrice: startPrice,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            highestBidder: address(0),
            isActive: true,
            quantity: quantity
        });

        emit AuctionCreated(auctionId, tokenId, msg.sender, startPrice, block.timestamp, block.timestamp + duration);
    }

    /**
     * @dev Place a bid on an auction
     * @param auctionId ID of the auction
     * @param bidAmount Bid amount
     */
    function placeBid(uint256 auctionId, uint256 bidAmount) 
        external 
        auctionExists(auctionId) 
        nonReentrant 
    {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(bidAmount > auction.currentPrice, "Bid must be higher than current price");
        require(msg.sender != auction.supplier, "Supplier cannot bid");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            agriToken.transfer(auction.highestBidder, auction.currentPrice);
        }

        // Transfer new bid amount from bidder to contract
        require(
            agriToken.transferFrom(msg.sender, address(this), bidAmount),
            "Token transfer failed"
        );

        // Update auction
        auction.currentPrice = bidAmount;
        auction.highestBidder = msg.sender;

        // Add bid to history
        auctionBids[auctionId].push(Bid({
            bidder: msg.sender,
            amount: bidAmount,
            timestamp: block.timestamp
        }));

        emit BidPlaced(auctionId, msg.sender, bidAmount);
    }

    /**
     * @dev End an auction
     * @param auctionId ID of the auction
     */
    function endAuction(uint256 auctionId) external auctionExists(auctionId) nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction not ended yet");

        auction.isActive = false;

        if (auction.highestBidder != address(0)) {
            // Transfer NFTs to winner
            agriNFT.safeTransferFrom(auction.supplier, auction.highestBidder, auction.tokenId, auction.quantity, "");

            // Transfer payment to supplier (minus platform fee)
            uint256 platformFeeAmount = (auction.currentPrice * platformFee) / BASIS_POINTS;
            uint256 supplierAmount = auction.currentPrice - platformFeeAmount;

            agriToken.transfer(owner(), platformFeeAmount);
            agriToken.transfer(auction.supplier, supplierAmount);

            // Add loyalty points to winner
            agriToken.addLoyaltyPoints(auction.highestBidder, auction.quantity, "Auction win reward");
        }

        emit AuctionEnded(auctionId, auction.highestBidder, auction.currentPrice);
    }

    /**
     * @dev Confirm delivery of an order
     * @param orderId ID of the order
     */
    function confirmDelivery(uint256 orderId) external orderExists(orderId) {
        Order storage order = orders[orderId];
        require(msg.sender == order.buyer, "Only buyer can confirm delivery");
        require(order.status == 1, "Order not paid");
        require(block.timestamp <= order.deliveryDeadline + DISPUTE_WINDOW, "Delivery deadline passed");

        order.status = 3; // Completed
    }

    /**
     * @dev Raise a dispute for an order
     * @param orderId ID of the order
     * @param reason Reason for dispute
     */
    function raiseDispute(uint256 orderId, string memory reason) 
        external 
        orderExists(orderId) 
    {
        Order storage order = orders[orderId];
        require(msg.sender == order.buyer, "Only buyer can raise dispute");
        require(order.status == 1, "Order not paid");
        require(block.timestamp <= order.deliveryDeadline + DISPUTE_WINDOW, "Dispute window closed");

        order.status = 4; // Disputed
        order.isDisputed = true;

        emit DisputeRaised(orderId, msg.sender, reason);
    }

    /**
     * @dev Resolve a dispute (only owner)
     * @param orderId ID of the order
     * @param refundApproved Whether to approve refund
     */
    function resolveDispute(uint256 orderId, bool refundApproved) 
        external 
        onlyOwner 
        orderExists(orderId) 
    {
        Order storage order = orders[orderId];
        require(order.isDisputed, "Order not disputed");

        if (refundApproved) {
            // Refund buyer
            agriToken.transfer(order.buyer, order.totalPrice);
            order.status = 5; // Cancelled
        } else {
            // Complete order
            order.status = 3; // Completed
        }

        order.isDisputed = false;

        emit DisputeResolved(orderId, msg.sender, refundApproved);
    }

    /**
     * @dev Get order details
     * @param orderId ID of the order
     * @return Order details
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    /**
     * @dev Get user orders
     * @param user Address of the user
     * @return Array of order IDs
     */
    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }

    /**
     * @dev Get supplier orders
     * @param supplier Address of the supplier
     * @return Array of order IDs
     */
    function getSupplierOrders(address supplier) external view returns (uint256[] memory) {
        return supplierOrders[supplier];
    }

    /**
     * @dev Get auction bids
     * @param auctionId ID of the auction
     * @return Array of bids
     */
    function getAuctionBids(uint256 auctionId) external view returns (Bid[] memory) {
        return auctionBids[auctionId];
    }

    /**
     * @dev Set platform fee
     * @param newFee New platform fee in basis points
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }

    /**
     * @dev Pause marketplace (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause marketplace
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw stuck tokens (only owner)
     * @param token Address of the token
     * @param amount Amount to withdraw
     */
    function withdrawStuckTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(agriToken), "Cannot withdraw AGRI tokens");
        IERC20(token).transfer(owner(), amount);
    }
} 