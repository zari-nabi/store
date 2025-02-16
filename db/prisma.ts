import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;

// Creates a new connection pool using the provided connection string, allowing multiple concurrent connections.
const pool = new Pool({ connectionString });

// Instantiates the Prisma adapter using the Neon connection pool to handle the connection between Prisma and Neon.
const adapter = new PrismaNeon(pool);

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Extends the PrismaClient with a custom result transformer to convert the price and rating fields to strings.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
      },
      order: {
        itemsPrice: {
          compute(order) {
            return order.itemsPrice.toString();
          },
        },
        shippingPrice: {
          compute(order) {
            return order.shippingPrice.toString();
          },
        },
        taxPrice: {
          compute(order) {
            return order.taxPrice.toString();
          },
        },
        totalPrice: {
          compute(order) {
            return order.totalPrice.toString();
          },
        },
      },
    },
  });
