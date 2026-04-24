import { selector } from "recoil";
import { cartAtom } from "./atoms";

export const cartTotalSelector = selector<number>({
  key: "cartTotalSelector",
  get: ({ get }) => get(cartAtom).reduce((s, i) => s + i.price * i.qty, 0),
});

export const cartCountSelector = selector<number>({
  key: "cartCountSelector",
  get: ({ get }) => get(cartAtom).reduce((s, i) => s + i.qty, 0),
});
