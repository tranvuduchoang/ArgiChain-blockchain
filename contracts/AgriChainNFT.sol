// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AgriChainNFT
 * @dev ERC-1155 NFT contract for agricultural products
 * This contract will be used for:
 * - NFT representation of agricultural products
 * - Product certificates and documentation
 * - Supply chain tracking
 */
contract AgriChainNFT is ERC1155, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;

    // Events
    event ProductNFTMinted(
        uint256 indexed tokenId,
        address indexed supplier,
        uint256 amount,
        string productName,
        string metadata
    );
    event ProductNFTBurned(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 amount,
        string reason
    );
    event NFTBurned(
        uint256 indexed tokenId,
        uint256 amount,
        address indexed user,
        address indexed supplier
    );
    event MetadataUpdated(uint256 indexed tokenId, string newMetadata);
    event SupplierAuthorized(address indexed supplier);
    event SupplierRevoked(address indexed supplier);

    // Structs
    struct ProductInfo {
        string name;
        string description;
        string category;
        address supplier;
        uint256 price;
        uint256 quantity;
        string unit;
        bool isOrganic;
        uint256 harvestDate;
        string location;
        string metadata;
        bool isActive;
    }

    // State variables
    mapping(uint256 => ProductInfo) public productInfo;
    mapping(address => bool) public authorizedSuppliers;
    mapping(address => uint256[]) public supplierProducts;
    
    uint256 public nextTokenId = 1;
    string public baseURI;
    string private contractURIValue;

    // Modifiers
    modifier onlyAuthorizedSupplier() {
        require(authorizedSuppliers[msg.sender] || msg.sender == owner(), "Not authorized supplier");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(productInfo[tokenId].isActive, "Token does not exist");
        _;
    }

    constructor(string memory _baseURI, string memory _contractURI) 
        ERC1155(_baseURI) 
        Ownable(msg.sender) 
    {
        baseURI = _baseURI;
        contractURIValue = _contractURI;
    }

    /**
     * @dev Mint NFT for a product
     * @param amount Amount of NFTs to mint
     * @param name Product name
     * @param description Product description
     * @param category Product category
     * @param price Product price in tokens
     * @param quantity Product quantity
     * @param unit Unit of measurement
     * @param isOrganic Whether product is organic
     * @param harvestDate Harvest date (timestamp)
     * @param location Harvest location
     * @param metadata Additional metadata (JSON string)
     */
    function mintProductNFT(
        uint256 amount,
        string memory name,
        string memory description,
        string memory category,
        uint256 price,
        uint256 quantity,
        string memory unit,
        bool isOrganic,
        uint256 harvestDate,
        string memory location,
        string memory metadata
    ) external onlyAuthorizedSupplier nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(quantity > 0, "Quantity must be greater than 0");

        uint256 tokenId = nextTokenId++;

        productInfo[tokenId] = ProductInfo({
            name: name,
            description: description,
            category: category,
            supplier: msg.sender,
            price: price,
            quantity: quantity,
            unit: unit,
            isOrganic: isOrganic,
            harvestDate: harvestDate,
            location: location,
            metadata: metadata,
            isActive: true
        });

        supplierProducts[msg.sender].push(tokenId);

        _mint(msg.sender, tokenId, amount, "");

        emit ProductNFTMinted(tokenId, msg.sender, amount, name, metadata);
    }

    /**
     * @dev Burn NFT (when product is sold/delivered)
     * @param tokenId ID of the token to burn
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burnProductNFT(uint256 tokenId, uint256 amount, string memory reason) 
        external 
        tokenExists(tokenId) 
        nonReentrant 
    {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");

        _burn(msg.sender, tokenId, amount);

        emit ProductNFTBurned(tokenId, msg.sender, amount, reason);
    }

    /**
     * @dev Update product metadata
     * @param tokenId ID of the token
     * @param newMetadata New metadata
     */
    function updateMetadata(uint256 tokenId, string memory newMetadata) 
        external 
        tokenExists(tokenId) 
    {
        require(
            msg.sender == productInfo[tokenId].supplier || msg.sender == owner(),
            "Only supplier or owner can update metadata"
        );

        productInfo[tokenId].metadata = newMetadata;
        emit MetadataUpdated(tokenId, newMetadata);
    }

    /**
     * @dev Get product information
     * @param tokenId ID of the token
     * @return Product information
     */
    function getProductInfo(uint256 tokenId) 
        external 
        view 
        tokenExists(tokenId) 
        returns (ProductInfo memory) 
    {
        return productInfo[tokenId];
    }

    /**
     * @dev Get all products by supplier
     * @param supplier Address of the supplier
     * @return Array of token IDs
     */
    function getSupplierProducts(address supplier) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return supplierProducts[supplier];
    }

    /**
     * @dev Authorize a supplier to mint NFTs
     * @param supplier Address of the supplier
     */
    function authorizeSupplier(address supplier) external onlyOwner {
        authorizedSuppliers[supplier] = true;
        emit SupplierAuthorized(supplier);
    }

    /**
     * @dev Revoke supplier authorization
     * @param supplier Address of the supplier
     */
    function revokeSupplier(address supplier) external onlyOwner {
        authorizedSuppliers[supplier] = false;
        emit SupplierRevoked(supplier);
    }

    /**
     * @dev Set base URI for token metadata
     * @param _baseURI New base URI
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /**
     * @dev Set contract URI
     * @param _contractURI New contract URI
     */
    function setContractURI(string memory _contractURI) external onlyOwner {
        contractURIValue = _contractURI;
    }

    /**
     * @dev Burn NFT after delivery confirmation
     * @param tokenId ID of the token to burn
     * @param amount Amount of tokens to burn
     * @param signature User signature for verification
     * @param user User address who confirmed delivery
     */
    function burnNFT(
        uint256 tokenId,
        uint256 amount,
        bytes32 signature,
        address user
    ) external onlyAuthorizedSupplier nonReentrant {
        require(balanceOf(user, tokenId) >= amount, "Insufficient balance");
        require(signature != bytes32(0), "Invalid signature");
        
        // Verify signature (simplified for demo)
        // In production, you would verify the signature properly
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, amount, user, block.timestamp));
        require(messageHash == signature, "Invalid signature");
        
        // Burn the NFT
        _burn(user, tokenId, amount);
        
        emit NFTBurned(tokenId, amount, user, msg.sender);
    }

    /**
     * @dev Get contract URI
     * @return Contract URI
     */
    function contractURI() external view returns (string memory) {
        return contractURIValue;
    }

    /**
     * @dev Override uri function to return token metadata
     * @param tokenId ID of the token
     * @return Token URI
     */
    function uri(uint256 tokenId) 
        public 
        view 
        override 
        tokenExists(tokenId) 
        returns (string memory) 
    {
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }

    /**
     * @dev Pause contract (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override safeTransferFrom to check for pause
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override whenNotPaused {
        super.safeTransferFrom(from, to, id, amount, data);
    }

    /**
     * @dev Override safeBatchTransferFrom to check for pause
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override whenNotPaused {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    /**
     * @dev Check if address is authorized supplier
     * @param supplier Address to check
     * @return True if authorized
     */
    function isAuthorizedSupplier(address supplier) external view returns (bool) {
        return authorizedSuppliers[supplier] || supplier == owner();
    }

    /**
     * @dev Get total number of products
     * @return Total number of products
     */
    function getTotalProducts() external view returns (uint256) {
        return nextTokenId - 1;
    }
} 