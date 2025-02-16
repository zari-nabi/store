"use server";

import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { prisma } from "@/db/prisma";
import { insertOrderSchema } from "../validator";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Create an order
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "Please add a shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Please select a payment method",
        redirectTo: "/payment-method",
      };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: Number(cart.itemsPrice),
      shippingPrice: Number(cart.shippingPrice),
      taxPrice: Number(cart.taxPrice),
      totalPrice: Number(cart.totalPrice),
    });

    // 💡 Use batch transaction instead of callback-based transaction
    const insertedOrder = await prisma.order.create({ data: order });

    // Prepare all order item creation queries
    const orderItems = cart.items.map((item) =>
      prisma.orderItem.create({
        data: {
          productId: item.productId,
          qty: item.qty, // Ensure correct property names
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          orderId: insertedOrder.id, // Link order item to order
        },
      })
    );

    // Clear cart query
    const clearCart = prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: [],
        totalPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        itemsPrice: 0,
      },
    });

    // Execute all queries in a batch transaction
    await prisma.$transaction([...orderItems, clearCart]);

    return {
      success: true,
      message: "Order successfully created",
      redirectTo: `/order/${insertedOrder.id}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  return convertToPlainObject(data);
}
