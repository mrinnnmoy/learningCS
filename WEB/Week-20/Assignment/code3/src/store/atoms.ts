import { atom } from "recoil";
import { Order, Product, OrderStatus } from "../types";
import { mockOrders } from "../data/mockOrders";
import { mockProducts } from "../data/mockProducts";

export const ordersAtom = atom<Order[]>({
  key: "ordersAtom",
  default: mockOrders,
});
export const productsAtom = atom<Product[]>({
  key: "productsAtom",
  default: mockProducts,
});
export const statusFilterAtom = atom<OrderStatus | "all">({
  key: "statusFilterAtom",
  default: "all",
});
export const searchAtom = atom<string>({ key: "searchAtom", default: "" });
