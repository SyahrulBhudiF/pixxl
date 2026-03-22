import { customAlphabet } from "nanoid";

const random = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz");

export function generateId() {
  return random(8);
}
