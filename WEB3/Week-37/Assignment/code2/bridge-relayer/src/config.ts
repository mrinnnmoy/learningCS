export const CHAIN_A_RPC = "http://127.0.0.1:8545";
export const CHAIN_B_RPC = "http://127.0.0.1:8546";

 // Add Easy's own real, deployed LockBox address on Chain A
export const LOCKBOX_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Add Easy's own real WrappedToken address on Chain B
export const WRAPPED_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Account 0 — the SAME address both contracts were configured to trust as `relayer`
export const RELAYER_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const LOCKBOX_ABI = [
  "event Locked(address indexed user, uint256 amount, uint256 indexed nonce, uint256 sourceChainId)",
];

export const WRAPPED_TOKEN_ABI = [
  "function mint(address to, uint256 amount, uint256 sourceNonce) external",
];
