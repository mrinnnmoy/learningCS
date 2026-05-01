import { router } from "../trpc";
import { authRouter } from "./auth";
import { productRouter } from "./product";
import { cartRouter } from "./cart";
import { orderRouter } from "./order";

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  cart: cartRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
