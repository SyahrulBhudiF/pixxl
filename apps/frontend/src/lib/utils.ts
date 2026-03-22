import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const random = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");
export function generateId() {
  return random(8);
}
