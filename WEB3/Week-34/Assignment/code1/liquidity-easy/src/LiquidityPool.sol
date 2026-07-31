// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract LiquidityPool is ERC20 {
    IERC20Minimal public immutable token0;
    IERC20Minimal public immutable token1;
    uint256 public reserve0;
    uint256 public reserve1;

    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    error InsufficientLiquidityMinted();
    error InsufficientLiquidityBurned();
    error SlippageExceeded();

    event Mint(
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    event Burn(
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );

    constructor(
        address _token0,
        address _token1
    ) ERC20("Pool LP Token", "PLP") {
        token0 = IERC20Minimal(_token0);
        token1 = IERC20Minimal(_token1);
    }

    function addLiquidity(
        uint256 amount0,
        uint256 amount1,
        uint256 minLiquidity
    ) external returns (uint256 liquidity) {
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);

        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0xdead), MINIMUM_LIQUIDITY); // permanently locked — Concept 2
        } else {
            liquidity = min(
                (amount0 * _totalSupply) / reserve0,
                (amount1 * _totalSupply) / reserve1
            );
        }

        if (liquidity == 0 || liquidity < minLiquidity)
            revert InsufficientLiquidityMinted();

        _mint(msg.sender, liquidity);
        reserve0 += amount0;
        reserve1 += amount1;

        emit Mint(msg.sender, amount0, amount1, liquidity);
    }

    function removeLiquidity(
        uint256 liquidity,
        uint256 minAmount0,
        uint256 minAmount1
    ) external returns (uint256 amount0, uint256 amount1) {
        uint256 _totalSupply = totalSupply();
        amount0 = (liquidity * reserve0) / _totalSupply;
        amount1 = (liquidity * reserve1) / _totalSupply;

        if (amount0 == 0 || amount1 == 0) revert InsufficientLiquidityBurned();
        if (amount0 < minAmount0 || amount1 < minAmount1)
            revert SlippageExceeded();

        _burn(msg.sender, liquidity);
        reserve0 -= amount0;
        reserve1 -= amount1;

        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);

        emit Burn(msg.sender, amount0, amount1, liquidity);
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
