import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(80, "Full name must be 80 characters or fewer."),
  jobTitle: z.string().trim().max(80, "Job title must be 80 characters or fewer."),
});

export const AVATAR_MAX_BYTES = 1_000_000;
export const avatarTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

export function validateAvatar(file: { size: number; type: string }) {
  if (!file.size) return "Choose an image to upload.";
  if (!(avatarTypes as readonly string[]).includes(file.type)) return "Use a PNG, JPEG, WebP, or GIF image.";
  if (file.size > AVATAR_MAX_BYTES) return "Images must be 1 MB or smaller.";
  return null;
}
