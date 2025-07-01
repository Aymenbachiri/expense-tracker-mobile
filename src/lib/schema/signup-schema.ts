import { z } from "zod";

export const signupSchema = z.object({
  emailAddress: z
    .string()
    .nonempty({ message: "Email is required" })
    .email("Must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupFormData = z.infer<typeof signupSchema>;
