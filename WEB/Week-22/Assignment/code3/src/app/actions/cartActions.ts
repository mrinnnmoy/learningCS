"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Helper: get or create a cart for the current user
async function getUserCart(userId: number) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
}

export async function addToCart(
  productId: number,
  quantity = 1,
): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  const userId = parseInt((session.user as { id: string }).id);
  const cart = await getUserCart(userId);

  const existing = cart.items.find((i) => i.productId === productId);

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  revalidatePath("/dashboard/cart");
}

export async function updateCartItem(
  itemId: number,
  quantity: number,
): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  revalidatePath("/dashboard/cart");
}

export async function removeFromCart(itemId: number): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/dashboard/cart");
}

export async function checkout(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const userId = parseInt((session.user as { id: string }).id);
  const cart = await getUserCart(userId);

  if (cart.items.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  // Validate stock before committing
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for ${item.product.name}`,
      };
    }
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  // Atomic transaction: create order, create order items, decrement stock, clear cart
  await prisma.$transaction([
    prisma.order.create({
      data: {
        userId,
        total,
        status: "pending",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
          })),
        },
      },
    }),
    ...cart.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      }),
    ),
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
  ]);

  revalidatePath("/dashboard/cart");
  revalidatePath("/dashboard/orders");
  revalidatePath("/products");

  return { success: true };
}
