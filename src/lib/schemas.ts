import z from "zod";

export const IDEA_LIMITS = {
  title: 100,
  description: 500,
} as const;

export const createIdeaSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(IDEA_LIMITS.title, "Title is too long"),
  description: z
    .string()
    .max(IDEA_LIMITS.description, "Description is too long")
    .optional(),
});

export type CreateIdeaFormData = z.infer<typeof createIdeaSchema>;
