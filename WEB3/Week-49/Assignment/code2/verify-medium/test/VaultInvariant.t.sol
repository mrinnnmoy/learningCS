// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {VaultWithBug} from "../src/VaultWithBug.sol";
import {Handler} from "./Handler.sol";

contract VaultInvariantTest is StdInvariant, Test {
    VaultWithBug vault;
    Handler handler;

    function setUp() public {
        vault = new VaultWithBug();
        handler = new Handler(vault);

        targetContract(address(handler));
    }

    function invariant_solvency() public view {
        assertEq(address(vault).balance, handler.totalTrackedClaims());
    }
}
