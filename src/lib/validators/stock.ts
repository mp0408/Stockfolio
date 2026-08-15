import { z } from "zod";

/**
 * Validation schema for manual stock adjustment.
 */
export const stockAdjustSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .refine((val) => val !== 0, "Quantity change cannot be zero"),
  reason: z
    .string()
    .max(500, "Reason is too long")
    .optional(),
});

export type StockAdjustFormData = z.infer<typeof stockAdjustSchema>;
