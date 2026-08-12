// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {BlacklistToken} from "../src/BlacklistToken.sol";

contract BlacklistTest is Test {
    BlacklistToken token;
    address owner = address(this);
    address alice = address(0xA1);
    address bob = address(0xB1);

    function setUp() public {
        token = new BlacklistToken(owner);
        token.mint(alice, 100 ether);
    }

    function testFix_OrdinaryTransferSucceedsWhenNeitherPartyIsBlacklisted()
        public
    {
        vm.prank(alice);
        token.transfer(bob, 50 ether);
        assertEq(token.balanceOf(bob), 50 ether);
    }

    function testExploit_BlacklistedSenderCannotTransferEvenToAnHonestRecipient()
        public
    {
        token.setBlacklisted(alice, true); // owner freezes alice — Concept 5's own real trust assumption

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(BlacklistToken.Blacklisted.selector, alice)
        );
        token.transfer(bob, 50 ether); // bob is entirely innocent — blocked anyway, by design
    }
}
