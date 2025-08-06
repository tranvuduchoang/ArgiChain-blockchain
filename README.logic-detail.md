# Giải thích chi tiết logic smart contract AgriChain

File này giúp bạn hiểu sâu từng dòng code, từng hàm, từng biến, từng quyết định thiết kế trong các smart contract của AgriChain. Đây là phần quan trọng nhất của dự án, quyết định tính minh bạch, bảo mật và logic vận hành của marketplace nông sản trên blockchain.

---

## 1. AgriChainToken (ERC-20)

### 1.1. Kế thừa
```solidity
contract AgriChainToken is ERC20, Ownable, Pausable, ReentrancyGuard
```
- **ERC20**: Chuẩn token ERC-20
- **Ownable**: Chỉ chủ sở hữu (admin) mới có quyền đặc biệt
- **Pausable**: Có thể tạm dừng chuyển token khi khẩn cấp
- **ReentrancyGuard**: Chống tấn công reentrancy (lặp lại gọi hàm)

### 1.2. State variables
```solidity
mapping(address => uint256) public loyaltyPoints;
```
- Lưu điểm thưởng (loyalty) cho từng user

```solidity
mapping(address => LoyaltyProgram) public supplierLoyaltyPrograms;
```
- Lưu cấu hình loyalty riêng cho từng supplier

```solidity
mapping(address => bool) public authorizedMinters;
```
- Danh sách các địa chỉ được phép mint token (ngoài owner)

```solidity
uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18;
uint256 public constant MAX_SUPPLY = 10000000 * 10**18;
```
- Tổng cung ban đầu và tối đa

### 1.3. Modifiers
```solidity
modifier onlyAuthorizedMinter() { ... }
```
- Chỉ owner hoặc địa chỉ được cấp phép mới được mint token

```solidity
modifier onlySupplier() { ... }
```
- Chỉ supplier đã đăng ký loyalty program mới được gọi hàm

### 1.4. Constructor
```solidity
constructor() ERC20("AgriChain Token", "AGRI") Ownable(msg.sender) { ... }
```
- Khởi tạo token với tên, ký hiệu, và mint cho owner số lượng ban đầu

### 1.5. Mint
```solidity
function mint(address to, uint256 amount) external onlyAuthorizedMinter { ... }
```
- Mint token mới, chỉ khi chưa vượt quá MAX_SUPPLY

### 1.6. Loyalty Points
```solidity
function addLoyaltyPoints(address user, uint256 amount, string memory reason) ...
```
- Cộng điểm thưởng cho user, chỉ minter mới được gọi
- Lưu lại lý do (reason) để audit

```solidity
function redeemLoyaltyPoints(uint256 amount) external nonReentrant { ... }
```
- User đổi điểm thưởng lấy token (mint token mới)

### 1.7. Loyalty Program cho Supplier
```solidity
function setupLoyaltyProgram(uint256 pointsPerPurchase, uint256 pointsToDiscount) external onlySupplier { ... }
```
- Supplier tự cấu hình chương trình loyalty riêng

### 1.8. Reward Supplier
```solidity
function rewardSupplier(address supplier, uint256 amount, string memory reason) ...
```
- Thưởng token cho supplier (ví dụ: đạt doanh số, sự kiện...)

### 1.9. Các hàm quản trị
- **addAuthorizedMinter/removeAuthorizedMinter**: Thêm/xóa quyền mint cho địa chỉ khác
- **pause/unpause**: Tạm dừng/khôi phục chuyển token
- **burn**: Đốt token (giảm cung)

### 1.10. Override transfer/transferFrom
- Đảm bảo không chuyển token khi contract đang pause

---

## 2. AgriChainNFT (ERC-1155)

### 2.1. Kế thừa
```solidity
contract AgriChainNFT is ERC1155, Ownable, Pausable, ReentrancyGuard
```
- **ERC1155**: Chuẩn NFT đa token (multi-token)
- **Ownable, Pausable, ReentrancyGuard**: Như trên

### 2.2. ProductInfo struct
- Lưu metadata chi tiết cho từng sản phẩm: tên, mô tả, loại, supplier, giá, số lượng, đơn vị, organic, ngày thu hoạch, vị trí, metadata JSON, trạng thái

### 2.3. State variables
- **productInfo**: mapping tokenId => ProductInfo
- **authorizedSuppliers**: mapping địa chỉ supplier được phép mint NFT
- **supplierProducts**: mapping supplier => danh sách tokenId
- **nextTokenId**: Tự động tăng cho mỗi sản phẩm mới
- **baseURI, contractURI**: Quản lý metadata chuẩn cho NFT

### 2.4. Modifiers
- **onlyAuthorizedSupplier**: Chỉ supplier được phép mới mint NFT
- **tokenExists**: Đảm bảo tokenId tồn tại

### 2.5. Mint NFT
```solidity
function mintProductNFT(...) external onlyAuthorizedSupplier nonReentrant { ... }
```
- Supplier mint NFT cho sản phẩm mới, lưu metadata, emit event

### 2.6. Burn NFT
```solidity
function burnProductNFT(uint256 tokenId, uint256 amount, string memory reason) ...
```
- Đốt NFT khi sản phẩm đã bán/giao dịch xong

### 2.7. Update Metadata
- Supplier hoặc owner có thể cập nhật metadata sản phẩm

### 2.8. Quản lý supplier
- **authorizeSupplier/revokeSupplier**: Owner cấp/quản lý quyền mint NFT cho supplier

### 2.9. Override URI
- Trả về metadata chuẩn cho từng tokenId

### 2.10. Pause/Unpause
- Dừng mọi giao dịch NFT khi khẩn cấp

---

## 3. AgriChainMarketplace

### 3.1. Kế thừa
```solidity
contract AgriChainMarketplace is ReentrancyGuard, Ownable, Pausable
```
- **ReentrancyGuard**: Chống reentrancy
- **Ownable**: Quản trị
- **Pausable**: Dừng khẩn cấp

### 3.2. Structs
- **Listing**: Thông tin sản phẩm đang bán (tokenId, supplier, giá, số lượng, thời hạn...)
- **Auction**: Thông tin phiên đấu giá (tokenId, supplier, giá khởi điểm, giá hiện tại, thời gian, highestBidder...)
- **Order**: Đơn hàng (buyer, supplier, số lượng, tổng tiền, trạng thái, thời gian, deadline giao hàng, dispute...)
- **Bid**: Lịch sử đặt giá trong auction

### 3.3. State variables
- **Counters**: Tự động tăng id cho listing, auction, order
- **agriToken, agriNFT**: Địa chỉ contract token và NFT
- **listings, auctions, orders**: mapping id => struct
- **auctionBids**: mapping auctionId => danh sách bid
- **userOrders, supplierOrders**: mapping user/supplier => danh sách orderId
- **platformFee**: Phí nền tảng (mặc định 2.5%)

### 3.4. List Product
```solidity
function listProduct(uint256 tokenId, uint256 price, uint256 quantity, uint256 expiryTime) ...
```
- Supplier đăng bán sản phẩm, kiểm tra đủ NFT, emit event

### 3.5. Buy Product
```solidity
function buyProduct(uint256 listingId, uint256 quantity) ...
```
- Buyer mua sản phẩm, chuyển token vào escrow, chuyển NFT, cập nhật order, cộng loyalty points

### 3.6. Auction
- **createAuction**: Supplier tạo phiên đấu giá
- **placeBid**: Buyer đặt giá, hoàn tiền cho bidder cũ nếu bị vượt
- **endAuction**: Kết thúc, chuyển NFT cho winner, thanh toán supplier, cộng loyalty points

### 3.7. Order & Dispute
- **confirmDelivery**: Buyer xác nhận đã nhận hàng
- **raiseDispute**: Buyer khiếu nại, admin giải quyết
- **resolveDispute**: Owner quyết định hoàn tiền hay không

### 3.8. Các hàm quản trị
- **setPlatformFee**: Đổi phí nền tảng
- **pause/unpause**: Dừng marketplace khi khẩn cấp
- **withdrawStuckTokens**: Rút token bị kẹt (trừ AGRI)

---

## 4. Script deploy.ts

- Deploy lần lượt AgriChainToken, AgriChainNFT, AgriChainMarketplace
- Cấu hình quyền mint, quyền supplier, cấp liquidity cho marketplace
- In ra địa chỉ contract, lưu thông tin deploy
- Chờ xác nhận block trước khi verify

---

## 5. Lý do thiết kế & best practices
- **Separation of concerns**: Tách biệt logic payment, NFT, marketplace
- **Security**: Sử dụng OpenZeppelin, kiểm tra input, chống reentrancy, access control
- **Gas optimization**: Sử dụng mapping, struct, batch operations
- **Auditability**: Event log chi tiết, lý do cho mọi thao tác quan trọng
- **Extensibility**: Dễ mở rộng loyalty, auction, dispute, fee...

---

## 6. Luồng hoạt động tổng quát
1. Supplier được owner cấp quyền mint NFT
2. Supplier mint NFT cho sản phẩm, đăng bán hoặc đấu giá
3. Buyer mua hoặc đấu giá, thanh toán bằng AGRI token
4. Marketplace escrow, chuyển NFT, cộng loyalty points
5. Buyer xác nhận nhận hàng hoặc khiếu nại
6. Admin giải quyết dispute, hoàn tiền nếu cần

---

**Nếu muốn giải thích sâu hơn về bất kỳ hàm, biến, event, hoặc logic nào, hãy hỏi tiếp nhé!**