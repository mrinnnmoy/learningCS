export const COUNTER_ADDRESS = "0xe22F630A1AB30a145EAf7B2fA92d49687e796268";

export const COUNTER_ABI = [
  "function getCount() view returns (uint256)",
  "function increment() external",
  "function incrementBy(uint256 amount) external",
  "function decrement() external",
  "event CountIncreased(address indexed by, uint256 newCount)",
  "event CountDecreased(address indexed by, uint256 newCount)",
];
