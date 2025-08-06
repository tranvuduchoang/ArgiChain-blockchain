// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgriChainToken
 * @dev ERC-20 token for AgriChain marketplace
 * This token will be used for:
 * - Payment for agricultural products
 * - Loyalty points system
 * - Rewards and incentives
 */
contract AgriChainToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    // Events
    event LoyaltyPointsAdded(address indexed user, uint256 amount, string reason);
    event LoyaltyPointsRedeemed(address indexed user, uint256 amount);
    event SupplierRewarded(address indexed supplier, uint256 amount, string reason);

    // Structs
    struct LoyaltyProgram {
        uint256 pointsPerPurchase; // Points earned per token spent
        uint256 pointsToDiscount;  // Points needed for 1 token discount
        bool isActive;
    }

    // State variables
    mapping(address => uint256) public loyaltyPoints;
    mapping(address => LoyaltyProgram) public supplierLoyaltyPrograms;
    mapping(address => bool) public authorizedMinters;
    
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18;    // 10 million tokens

    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    modifier onlySupplier() {
        require(supplierLoyaltyPrograms[msg.sender].isActive, "Not a registered supplier");
        _;
    }

    constructor() ERC20("AgriChain Token", "AGRI") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint new tokens (only authorized minters or owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyAuthorizedMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Add loyalty points to a user
     * @param user Address of the user
     * @param amount Amount of points to add
     * @param reason Reason for adding points
     */
    function addLoyaltyPoints(address user, uint256 amount, string memory reason) 
        external 
        onlyAuthorizedMinter 
    {
        loyaltyPoints[user] += amount;
        emit LoyaltyPointsAdded(user, amount, reason);
    }

    /**
     * @dev Redeem loyalty points for tokens
     * @param amount Amount of points to redeem
     */
    function redeemLoyaltyPoints(uint256 amount) external nonReentrant {
        require(loyaltyPoints[msg.sender] >= amount, "Insufficient loyalty points");
        require(amount > 0, "Amount must be greater than 0");
        
        loyaltyPoints[msg.sender] -= amount;
        _mint(msg.sender, amount);
        
        emit LoyaltyPointsRedeemed(msg.sender, amount);
    }

    /**
     * @dev Set up loyalty program for a supplier
     * @param pointsPerPurchase Points earned per token spent
     * @param pointsToDiscount Points needed for 1 token discount
     */
    function setupLoyaltyProgram(uint256 pointsPerPurchase, uint256 pointsToDiscount) 
        external 
        onlySupplier 
    {
        supplierLoyaltyPrograms[msg.sender] = LoyaltyProgram({
            pointsPerPurchase: pointsPerPurchase,
            pointsToDiscount: pointsToDiscount,
            isActive: true
        });
    }

    /**
     * @dev Reward a supplier with tokens
     * @param supplier Address of the supplier
     * @param amount Amount of tokens to reward
     * @param reason Reason for the reward
     */
    function rewardSupplier(address supplier, uint256 amount, string memory reason) 
        external 
        onlyAuthorizedMinter 
    {
        require(supplierLoyaltyPrograms[supplier].isActive, "Supplier not active");
        _mint(supplier, amount);
        emit SupplierRewarded(supplier, amount, reason);
    }

    /**
     * @dev Get loyalty points balance for a user
     * @param user Address of the user
     * @return Balance of loyalty points
     */
    function getLoyaltyPoints(address user) external view returns (uint256) {
        return loyaltyPoints[user];
    }

    /**
     * @dev Get loyalty program for a supplier
     * @param supplier Address of the supplier
     * @return Loyalty program details
     */
    function getLoyaltyProgram(address supplier) 
        external 
        view 
        returns (LoyaltyProgram memory) 
    {
        return supplierLoyaltyPrograms[supplier];
    }

    /**
     * @dev Add authorized minter
     * @param minter Address to authorize
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /**
     * @dev Remove authorized minter
     * @param minter Address to remove authorization
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer function to check for pause
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom function to check for pause
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Burn tokens (only owner or authorized minters)
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        require(msg.sender == owner() || authorizedMinters[msg.sender], "Not authorized to burn");
        _burn(msg.sender, amount);
    }
} 