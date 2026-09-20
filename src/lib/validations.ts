import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/),
  sku: z.string().min(2).max(60),
  description: z.string().max(5000).optional(),
  brand: z.string().max(80).optional(),
  category: z.string().max(80).optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  lowStockAt: z.number().int().nonnegative().default(5),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false)
});

export const couponSchema = z.object({
  code: z.string().min(3).max(30).transform((v) => v.trim().toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional()
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(5).max(1000)
});
