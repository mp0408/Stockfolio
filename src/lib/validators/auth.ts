import { z } from "zod";

/**
 * Validation schema for the signup form.
 * Validates all fields with human-readable error messages.
 */
export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password needs a lowercase letter, uppercase letter, and a number"
    ),
  storeName: z
    .string()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name is too long"),
  role: z.enum(["manager", "staff"], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
});

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Validation schema for the login form.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
