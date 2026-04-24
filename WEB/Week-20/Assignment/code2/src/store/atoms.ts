import { atom } from "recoil";
import { CartItem } from "../types";

export const cartAtom = atom<CartItem[]>({
  key: "cartAtom",
  default: [],
});

export const searchAtom = atom<string>({
  key: "searchAtom",
  default: "",
});
