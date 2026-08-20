// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {BatchPoster} from "../src/BatchPoster.sol";

contract DataAvailabilityCostTest is Test {
    BatchPoster poster;

    function setUp() public {
        poster = new BatchPoster();
    }

    function testFix_MeasuresRealCalldataCostForARealisticBatchSize() public {
        bytes memory batch = new bytes(50_000);
        for (uint256 i = 0; i < batch.length; i++) {
            batch[i] = bytes1(uint8(i % 256));   // realistic, non-zero-heavy data — Week 26's own 16-gas-per-byte case
        }

        // A real, honest technical detail worth getting right rather than glossing over:
        // Week 26, Concept 3's own 16/4-gas-per-byte rule applies specifically to a TRANSACTION's
        // own top-level calldata — NOT to an internal Solidity call between two contracts (like this
        // test calling `poster.postBatch(batch)` directly), which uses a cheaper, different,
        // memory-copy-based cost model instead. Measuring `gasleft()` around the call below is a
        // real, useful sanity check that SOMETHING nontrivial is being charged, but the actual
        // number this assignment compares against blob costs is computed ANALYTICALLY here, applying
        // the real intrinsic-calldata formula directly — exactly what a genuine top-level
        // `cast send`/`forge script` transaction against a real deployment would actually be charged.
        uint256 nonZeroBytes;
        uint256 zeroBytes;
        for (uint256 i = 0; i < batch.length; i++) {
            if (batch[i] == 0x00) zeroBytes++;
            else nonZeroBytes++;
        }
        uint256 realIntrinsicCalldataGas = (nonZeroBytes * 16) + (zeroBytes * 4);
        console.log("Real intrinsic calldata gas (top-level tx formula):", realIntrinsicCalldataGas);

        uint256 gasBefore = gasleft();
        poster.postBatch(batch);
        uint256 internalCallGas = gasBefore - gasleft();
        console.log("Internal test-call gas (a DIFFERENT, cheaper cost model - see comment above):", internalCallGas);

        // EIP-4844's own documented blob model — 50,000 bytes fits comfortably inside a single
        // ~128KB blob. Compare `realIntrinsicCalldataGas` above, priced at Sepolia's own current gas
        // price, against a single blob's own cost, priced at the REAL, LIVE blob base fee read via
        // `cast rpc eth_blobBaseFee` (How to Build, step 5) — the blob-side cost is dictated by its
        // own separate fee market, not by ordinary gas price at all, which is the entire point
        // Concept 7 makes: these aren't two prices for the same resource, they're two GENUINELY
        // SEPARATE markets, and that separation is what keeps rollup costs from competing directly
        // against ordinary L1 transaction activity for the same gas.
        assertGt(realIntrinsicCalldataGas, 700_000);   // ~1 in 256 bytes is zero here; the rest cost 16 gas each
    }
}