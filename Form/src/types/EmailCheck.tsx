import { isEmailFormat } from "./Common";

const emailCache = new Map<string, boolean>();
const keyOf = (email: string) => email.trim().toLowerCase();

export async function checkEmailTaken(email: string): Promise<boolean> {
  const key = keyOf(email);
  if (emailCache.has(key)) return emailCache.get(key)!;
  await new Promise((r) => setTimeout(r, 600));
  const taken = key === "taken@company.com";
  emailCache.set(key, taken);
  return taken;
}
export const isEmailKnownTaken = (email: string) =>
  emailCache.get(keyOf(email)) === true;
export const ensureEmailChecked = async (email: string) => {
  if (isEmailFormat(email)) await checkEmailTaken(email);
};
