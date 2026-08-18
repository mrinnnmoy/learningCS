// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {OnChainMultisig} from "../src/OnChainMultisig.sol";
import {OffChainMultisig} from "../src/OffChainMultisig.sol";

contract MultisigComparisonTest is Test {
    uint256 owner1Key = 0x1;
    uint256 owner2Key = 0x2;
    address owner1;
    address owner2;
    address owner3 = address(0x3);
    address recipient = address(0xCAFE);

    function setUp() public {
        owner1 = vm.addr(owner1Key);
        owner2 = vm.addr(owner2Key);
    }

    function _sign(
        uint256 key,
        bytes32 messageHash
    ) internal pure returns (bytes memory) {
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    function testFix_BothReachTheIdenticalTwoOfThreeThreshold() public {
        address[] memory owners = new address[](3);
        owners[0] = owner1;
        owners[1] = owner2;
        owners[2] = owner3;

        OnChainMultisig onChain = new OnChainMultisig(owners, 2);
        vm.deal(address(onChain), 1 ether);

        uint256 gasBefore = gasleft();
        vm.prank(owner1);
        uint256 txId = onChain.submit(recipient, 1 ether, "");
        vm.prank(owner1);
        onChain.confirm(txId);
        vm.prank(owner2);
        onChain.confirm(txId);
        vm.prank(owner1);
        onChain.execute(txId);
        uint256 onChainGas = gasBefore - gasleft();

        OffChainMultisig offChain = new OffChainMultisig(owners, 2);
        vm.deal(address(offChain), 1 ether);

        bytes32 messageHash = keccak256(
            abi.encode(
                recipient,
                uint256(1 ether),
                bytes(""),
                uint256(0),
                address(offChain)
            )
        );
        bytes[] memory signatures = new bytes[](2);
        signatures[0] = _sign(owner1Key, messageHash);
        signatures[1] = _sign(owner2Key, messageHash);

        uint256 gasBefore2 = gasleft();
        offChain.executeWithSignatures(recipient, 1 ether, "", 0, signatures);
        uint256 offChainGas = gasBefore2 - gasleft();

        console.log("OnChainMultisig total gas (4 transactions):", onChainGas);
        console.log("OffChainMultisig total gas (1 transaction):", offChainGas);
        assertLt(offChainGas, onChainGas);
    }
}
