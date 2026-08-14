// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {NormalizedRegistry} from "../src/NormalizedRegistry.sol";
import {DenormalizedRegistry} from "../src/DenormalizedRegistry.sol";
import {UnpackedStorage} from "../src/UnpackedStorage.sol";
import {PackedStorage} from "../src/PackedStorage.sol";

contract StorageCostsTest is Test {
    function testFix_DenormalizedReadCostsLessThanNormalized() public {
        NormalizedRegistry normalized = new NormalizedRegistry();
        DenormalizedRegistry denormalized = new DenormalizedRegistry();

        address user = address(0xA1);

        vm.deal(user, 2 ether);

        vm.startPrank(user);

        normalized.register("Alice");
        normalized.deposit{value: 1 ether}();

        denormalized.register("Alice");
        denormalized.deposit{value: 1 ether}();

        vm.stopPrank();

        // Warm up both contracts so the comparison measures the
        // actual read operation rather than first-call setup effects.
        normalized.getUserSummary(user);
        denormalized.getUserSummary(user);

        uint256 gasBeforeNormalized = gasleft();
        (bool success1, bytes memory normalizedData) = address(normalized).call(
            abi.encodeWithSelector(
                NormalizedRegistry.getUserSummary.selector,
                user
            )
        );
        uint256 normalizedGas = gasBeforeNormalized - gasleft();

        require(success1, "normalized call failed");

        uint256 gasBeforeDenormalized = gasleft();
        (bool success2, bytes memory denormalizedData) = address(denormalized)
            .call(
                abi.encodeWithSelector(
                    DenormalizedRegistry.getUserSummary.selector,
                    user
                )
            );
        uint256 denormalizedGas = gasBeforeDenormalized - gasleft();

        require(success2, "denormalized call failed");

        // Verify both implementations return the same data.
        (string memory normalizedName, uint256 normalizedAmount) = abi.decode(
            normalizedData,
            (string, uint256)
        );

        (string memory denormalizedName, uint256 denormalizedAmount) = abi
            .decode(denormalizedData, (string, uint256));

        assertEq(normalizedName, "Alice");
        assertEq(denormalizedName, "Alice");
        assertEq(normalizedAmount, 1 ether);
        assertEq(denormalizedAmount, 1 ether);

        console.log("Normalized getUserSummary gas:", normalizedGas);
        console.log("Denormalized getUserSummary gas:", denormalizedGas);

        assertLt(denormalizedGas, normalizedGas);
    }

    function testFix_PackedWriteCostsLessGasThanUnpacked() public {
        UnpackedStorage unpacked = new UnpackedStorage();
        PackedStorage packed = new PackedStorage();

        uint256 gasBeforeUnpacked = gasleft();

        unpacked.create(1, 100, 5 ether);

        uint256 unpackedGas = gasBeforeUnpacked - gasleft();

        uint256 gasBeforePacked = gasleft();

        packed.create(1, 100, 5 ether);

        uint256 packedGas = gasBeforePacked - gasleft();

        console.log("Unpacked create() gas:", unpackedGas);
        console.log("Packed create() gas:", packedGas);

        assertLt(packedGas, unpackedGas);
    }
}
