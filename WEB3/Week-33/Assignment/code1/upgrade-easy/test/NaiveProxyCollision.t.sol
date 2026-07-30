// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {NaiveImplementation} from "../src/NaiveImplementation.sol";
import {NaiveProxy} from "../src/NaiveProxy.sol";

contract NaiveProxyCollisionTest is Test {
    function testExploit_SetOwnerCorruptsProxysOwnImplementationSlot() public {
        NaiveImplementation impl = new NaiveImplementation();
        NaiveProxy proxy = new NaiveProxy(address(impl));

        address realImplementationBefore = proxy.implementation();
        assertEq(realImplementationBefore, address(impl));

        // Calling setOwner THROUGH the proxy — runs impl's code, but writes to the PROXY's own storage.
        NaiveImplementation(address(proxy)).setOwner(address(0xBEEF));

        // slot 0 is now 0xBEEF in the PROXY's own storage — implementation() reads garbage, corrupted.
        assertEq(proxy.implementation(), address(0xBEEF));
        assertTrue(proxy.implementation() != realImplementationBefore);   // the collision, made concrete
    }
}