// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {RestakingManager} from "../src/RestakingManager.sol";

contract RestakingManagerTest is Test {
    RestakingManager manager;
    address restaker = address(0xA1);
    address avsSlasher = address(0xB1);
    bytes32 constant AVS_ID = keccak256("BridgeAVS");

    function setUp() public {
        manager = new RestakingManager();
        manager.registerAVS(AVS_ID, avsSlasher);

        vm.deal(restaker, 100 ether);
        vm.startPrank(restaker);
        manager.restake{value: 100 ether}();
        manager.optIntoAVS(AVS_ID);
        vm.stopPrank();
    }

    function testFix_LegitimateSlashReducesExactlyTheOptedInRestaker() public {
        vm.prank(avsSlasher);
        manager.slash(restaker, AVS_ID, 20 ether);

        assertEq(manager.restaked(restaker), 80 ether);
    }

    function testExploit_CannotSlashARestakerWhoNeverOptedIn() public {
        address otherRestaker = address(0xC1);
        vm.deal(otherRestaker, 50 ether);
        vm.prank(otherRestaker);
        manager.restake{value: 50 ether}(); // restaked, but NEVER opted into AVS_ID

        vm.prank(avsSlasher);
        vm.expectRevert(RestakingManager.NotOptedIn.selector);
        manager.slash(otherRestaker, AVS_ID, 10 ether);
    }

    function testExploit_OnlyTheRegisteredSlasherCanSlash() public {
        address impostor = address(0xD1);
        vm.prank(impostor);
        vm.expectRevert(RestakingManager.NotSlasher.selector);
        manager.slash(restaker, AVS_ID, 10 ether);
    }
}
