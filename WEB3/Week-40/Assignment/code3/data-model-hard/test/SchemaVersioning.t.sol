// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {UserRegistryV1} from "../src/UserRegistryV1.sol";
import {UserRegistryV2} from "../src/UserRegistryV2.sol";

contract SchemaVersioningTest is Test {
    UserRegistryV1 v1;
    UserRegistryV2 v2;
    address alice = address(0xA1);
    address bob = address(0xB1);

    function setUp() public {
        v1 = new UserRegistryV1();

        vm.prank(alice);
        v1.register("Alice");
        vm.prank(bob);
        v1.register("Bob");

        v2 = new UserRegistryV2(address(v1)); // a GENUINELY separate deployment, reading V1 by interface
    }

    function testFix_V2CorrectlyReadsNeverMigratedV1DataViaFallback() public {
        (string memory name, uint256 registeredAt, string memory bio) = v2
            .getUser(alice);

        assertEq(name, "Alice");
        assertTrue(registeredAt > 0);
        assertEq(bio, ""); // correctly empty — Alice has never touched V2's own storage at all
    }

    function testFix_SetBioLazilyMigratesOnlyTheCallingUser() public {
        vm.prank(alice);
        v2.setBio("Solidity enjoyer");

        (string memory aliceName, , string memory aliceBio) = v2.getUser(alice);
        assertEq(aliceName, "Alice");
        assertEq(aliceBio, "Solidity enjoyer");
        (, , uint8 aliceVersion, ) = v2.usersV2(alice);
        assertEq(aliceVersion, 2); // genuinely migrated now

        // Bob never called setBio — still correctly falls back to V1, untouched.
        (string memory bobName, , string memory bobBio) = v2.getUser(bob);
        assertEq(bobName, "Bob");
        assertEq(bobBio, "");
        (, , uint8 bobVersion, ) = v2.usersV2(bob);
        assertEq(bobVersion, 0); // never migrated
    }
}
