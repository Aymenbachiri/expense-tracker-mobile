import { Types } from "mongoose";
import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const n = parseFloat(val);
        return isNaN(n) ? val : n;
      }
      return val;
    },
    z
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be greater than 0")
      .min(0.01, "Amount must be at least 0.01")
      .max(999999.99, "Amount cannot exceed 999,999.99"),
  ),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(1, "Description cannot be empty")
    .max(200, "Description cannot be more than 200 characters")
    .trim(),
  notes: z
    .string()
    .max(500, "Notes cannot be more than 500 characters")
    .trim()
    .optional(),
  category: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid category ID format",
  }),
  date: z
    .date()
    .or(z.date())
    .transform((val) => new Date(val)),
});

export type ExpenseFormValues = z.infer<typeof createExpenseSchema>;
