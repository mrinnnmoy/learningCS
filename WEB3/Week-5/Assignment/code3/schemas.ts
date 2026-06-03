export const OWNER_LEN = 32;

export const V1_SCHEMA = {
  struct: {
    owner: { array: { type: "u8", len: OWNER_LEN } },
    balance: "u64",
  },
} as const;

export const V2_SCHEMA = {
  struct: {
    owner: { array: { type: "u8", len: OWNER_LEN } },
    balance: "u64",
    decimals: "u8",
  },
} as const;

export interface AccountV1 {
  owner: number[];
  balance: bigint;
}

export interface AccountV2 {
  owner: number[];
  balance: bigint;
  decimals: number;
}

export const DEFAULT_DECIMALS = 6;
