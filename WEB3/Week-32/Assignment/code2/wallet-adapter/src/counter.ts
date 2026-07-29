export const COUNTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // replace with YOUR deployed address

export const COUNTER_ABI = [
  "function getCount() view returns (uint256)",
  "function increment() external",
  "function incrementBy(uint256 amount) external",
  "function decrement() external",
  "event CountIncreased(address indexed by, uint256 newCount)",
  "event CountDecreased(address indexed by, uint256 newCount)",
];
