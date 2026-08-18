// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

// Week 38's own SimpleMultisig, reused directly — Safe's own real shape.
contract OnChainMultisig {
    address[] public owners;
    uint256 public immutable threshold;
    mapping(address => bool) public isOwner;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public hasConfirmed;

    error NotOwner();
    error AlreadyConfirmed();
    error AlreadyExecuted();
    error InsufficientConfirmations();
    error ExecutionFailed();

    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert NotOwner();
        _;
    }

    constructor(address[] memory _owners, uint256 _threshold) {
        for (uint256 i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        threshold = _threshold;
    }

    receive() external payable {}

    function submit(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (uint256 txId) {
        txId = transactions.length;
        transactions.push(
            Transaction({
                to: to,
                value: value,
                data: data,
                executed: false,
                confirmations: 0
            })
        );
    }

    function confirm(uint256 txId) external onlyOwner {
        if (hasConfirmed[txId][msg.sender]) revert AlreadyConfirmed();
        if (transactions[txId].executed) revert AlreadyExecuted();
        hasConfirmed[txId][msg.sender] = true;
        transactions[txId].confirmations++;
    }

    function execute(uint256 txId) external onlyOwner {
        Transaction storage txn = transactions[txId];
        if (txn.executed) revert AlreadyExecuted();
        if (txn.confirmations < threshold) revert InsufficientConfirmations();
        txn.executed = true;
        (bool ok, ) = txn.to.call{value: txn.value}(txn.data);
        if (!ok) revert ExecutionFailed();
    }
}
