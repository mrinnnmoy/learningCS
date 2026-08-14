// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract Marketplace {
    struct Listing {
        address seller;
        uint256 price;
        string title;
    }

    Listing[] public listings;

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        uint256 price,
        string title
    );

    function createListing(
        uint256 price,
        string calldata title
    ) external returns (uint256 listingId) {
        listingId = listings.length;
        listings.push(Listing(msg.sender, price, title));
        emit ListingCreated(listingId, msg.sender, price, title); // Concept 7 — the real, off-chain-indexable path
    }

    // NAIVE — grows without bound (Concept 6). Never ship this against a genuinely large dataset.
    function getAllListings() external view returns (Listing[] memory) {
        return listings;
    }

    function getListings(
        uint256 offset,
        uint256 limit
    ) external view returns (Listing[] memory page) {
        uint256 total = listings.length;
        if (offset >= total) return new Listing[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        page = new Listing[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = listings[i];
        }
    }

    function totalListings() external view returns (uint256) {
        return listings.length;
    }
}
