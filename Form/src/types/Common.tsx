import type { z } from "zod";
import type {
  experienceSchema,
  personalSchema,
  reviewSchema,
  skillsSchema,
} from "./Schemas";

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export const WORK_MODES = ["Onsite", "Hybrid", "Remote"] as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmailFormat = (v: string) => EMAIL_RE.test(v.trim());
export const formatVnd = (digits: string) =>
  digits ? Number(digits).toLocaleString("en-US") : "";

export type ApplicationForm = z.infer<typeof personalSchema> &
  z.infer<typeof experienceSchema> &
  z.infer<typeof skillsSchema> &
  z.infer<typeof reviewSchema>;

export type ItemName = `workExperience.${number}`;
