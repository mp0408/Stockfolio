import { z } from "zod";

/**
 * Validation schema for adding a new product.
 */
export const addProductSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name is too long"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU is too long")
    .regex(
      /^[A-Za-z0-9\-_]+$/,
      "SKU can only contain letters, numbers, hyphens, and underscores"
    ),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  low_stock_threshold: z
    .number({ invalid_type_error: "Threshold must be a number" })
    .int("Threshold must be a whole number")
    .min(1, "Threshold must be at least 1"),
});

export type AddProductFormData = z.infer<typeof addProductSchema>;
