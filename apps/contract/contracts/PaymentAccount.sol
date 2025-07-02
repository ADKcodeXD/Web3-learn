// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title Payment Account Contract - 收款账户合约
/// @dev Only chairman can withdraw funds, supports token deposits and order tracking
contract PaymentAccount {
    address public chairman; // 主席地址
    uint256 public orderCounter; // 订单计数器

    struct Order {
        uint256 orderId;
        address sender;
        address token; // 代币地址 (0x0 表示ETH)
        uint256 amount;
        uint256 timestamp;
        string description;
    }

    // 存储所有订单
    mapping(uint256 => Order) public orders;
    // 用户订单映射
    mapping(address => uint256[]) public userOrders;
    // 代币余额追踪
    mapping(address => uint256) public tokenBalances;

    // 事件
    event PaymentReceived(
        uint256 indexed orderId,
        address indexed sender,
        address indexed token,
        uint256 amount,
        string description
    );
    event Withdrawal(address indexed token, uint256 amount, address indexed to);
    event ChairmanChanged(
        address indexed oldChairman,
        address indexed newChairman
    );

    // 修饰符
    modifier onlyChairman() {
        require(
            msg.sender == chairman,
            "Only chairman can perform this action"
        );
        _;
    }

    constructor(address _chairman) {
        chairman = _chairman;
        orderCounter = 0;
    }

    function payETH(string memory description) external payable {
        require(msg.value > 0, "Payment amount must be greater than 0");
        orderCounter++;
        orders[orderCounter] = Order({
            orderId: orderCounter,
            sender: msg.sender,
            token: address(0), // ETH用0地址表示
            amount: msg.value,
            timestamp: block.timestamp,
            description: description
        });

        userOrders[msg.sender].push(orderCounter);
        tokenBalances[address(0)] += msg.value;

        emit PaymentReceived(
            orderCounter,
            msg.sender,
            address(0),
            msg.value,
            description
        );
    }

    /// @dev 接收ERC20代币付款
    /// @param token 代币合约地址
    /// @param amount 付款金额
    /// @param description 订单描述
    function payToken(
        address token,
        uint256 amount,
        string memory description
    ) external {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Payment amount must be greater than 0");

        IERC20 tokenContract = IERC20(token);
        require(
            tokenContract.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        orderCounter++;
        orders[orderCounter] = Order({
            orderId: orderCounter,
            sender: msg.sender,
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            description: description
        });

        userOrders[msg.sender].push(orderCounter);
        tokenBalances[token] += amount;

        emit PaymentReceived(
            orderCounter,
            msg.sender,
            token,
            amount,
            description
        );
    }

    /// @dev 主席提取ETH
    /// @param amount 提取金额
    /// @param to 接收地址
    function withdrawETH(
        uint256 amount,
        address payable to
    ) external onlyChairman {
        require(
            tokenBalances[address(0)] >= amount,
            "Insufficient ETH balance"
        );
        require(to != address(0), "Invalid recipient address");

        tokenBalances[address(0)] -= amount;
        to.transfer(amount);

        emit Withdrawal(address(0), amount, to);
    }

    /// @dev 主席提取ERC20代币
    /// @param token 代币合约地址
    /// @param amount 提取金额
    /// @param to 接收地址
    function withdrawToken(
        address token,
        uint256 amount,
        address to
    ) external onlyChairman {
        require(token != address(0), "Invalid token address");
        require(tokenBalances[token] >= amount, "Insufficient token balance");
        require(to != address(0), "Invalid recipient address");

        tokenBalances[token] -= amount;
        IERC20 tokenContract = IERC20(token);
        require(tokenContract.transfer(to, amount), "Token transfer failed");

        emit Withdrawal(token, amount, to);
    }

    /// @dev 查询订单详情
    /// @param orderId 订单ID
    function getOrder(uint256 orderId) external view returns (Order memory) {
        require(orderId > 0 && orderId <= orderCounter, "Invalid order ID");
        return orders[orderId];
    }

    /// @dev 查询用户的所有订单ID
    /// @param user 用户地址
    function getUserOrders(
        address user
    ) external view returns (uint256[] memory) {
        return userOrders[user];
    }

    /// @dev 查询用户的订单详情（分页）
    /// @param user 用户地址
    /// @param offset 偏移量
    /// @param limit 限制数量
    function getUserOrdersWithDetails(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (Order[] memory) {
        uint256[] memory userOrderIds = userOrders[user];
        require(offset < userOrderIds.length, "Offset out of bounds");

        uint256 end = offset + limit;
        if (end > userOrderIds.length) {
            end = userOrderIds.length;
        }

        Order[] memory result = new Order[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = orders[userOrderIds[i]];
        }

        return result;
    }

    /// @dev 按日期范围查询订单
    /// @param startTime 开始时间戳
    /// @param endTime 结束时间戳
    function getOrdersByDateRange(
        uint256 startTime,
        uint256 endTime
    ) external view returns (Order[] memory) {
        require(startTime <= endTime, "Invalid time range");
        uint256 count = 0;
        for (uint256 i = 1; i <= orderCounter; i++) {
            if (
                orders[i].timestamp >= startTime &&
                orders[i].timestamp <= endTime
            ) {
                count++;
            }
        }

        // 创建结果数组
        Order[] memory result = new Order[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= orderCounter; i++) {
            if (
                orders[i].timestamp >= startTime &&
                orders[i].timestamp <= endTime
            ) {
                result[index] = orders[i];
                index++;
            }
        }

        return result;
    }

    /// @dev 获取代币余额
    /// @param token 代币地址 (0x0 表示ETH)
    function getTokenBalance(address token) external view returns (uint256) {
        return tokenBalances[token];
    }

    /// @dev 获取合约总订单数
    function getTotalOrders() external view returns (uint256) {
        return orderCounter;
    }

    /// @dev 更换主席
    /// @param newChairman 新主席地址
    function changeChairman(address newChairman) external onlyChairman {
        require(newChairman != address(0), "Invalid chairman address");
        require(newChairman != chairman, "Same chairman address");

        address oldChairman = chairman;
        chairman = newChairman;

        emit ChairmanChanged(oldChairman, newChairman);
    }
}
