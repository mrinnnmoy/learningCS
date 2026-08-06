// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedToken is ERC20 {
    address public immutable relayer;
    uint256 public immutable sourceChainId;
    address public immutable sourceLockBox;
    mapping(bytes32 => bool) public processedNonces;

    error NotRelayer();
    error AlreadyProcessed();

    constructor(
        address _relayer,
        uint256 _sourceChainId,
        address _sourceLockBox
    ) ERC20("Wrapped Token", "wTOKEN") {
        relayer = _relayer;
        sourceChainId = _sourceChainId;
        sourceLockBox = _sourceLockBox;
    }

    function mint(address to, uint256 amount, uint256 sourceNonce) external {
        if (msg.sender != relayer) revert NotRelayer();

        bytes32 messageId = keccak256(
            abi.encode(sourceChainId, sourceLockBox, sourceNonce)
        ); // Concept 6
        if (processedNonces[messageId]) revert AlreadyProcessed();
        processedNonces[messageId] = true;

        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
