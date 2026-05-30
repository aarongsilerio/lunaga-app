import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type UserIdentity = {
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
};

// Formats a standard user name
export function formatName(user?: UserIdentity | null, fallback = "Unknown User"): string {
  if (!user) return fallback;
  
  const first = user.firstName || "";
  const last = user.lastName || "";
  const fullName = `${first} ${last}`.trim();
  
  return fullName.length > 0 ? fullName : fallback;
}

// Formats a doctor's name with their title
export function formatDoctorName(user?: UserIdentity | null, fallback = "Unknown Doctor"): string {
  if (!user) return fallback;
  
  const title = user.title || "Dr.";
  const first = user.firstName || "";
  const last = user.lastName || "";
  const fullName = `${title} ${first} ${last}`.trim();
  
  return fullName === "Dr." ? fallback : fullName;
}