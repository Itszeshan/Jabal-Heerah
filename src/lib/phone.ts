/** Returns +9715xxxxxxxx or null when the value is not a UAE mobile. */
export function normalizeUaeMobile(input: string): string | null {
  const compact = input.replace(/[^\d+]/g, "");
  let national = compact;
  if (national.startsWith("+971")) national = national.slice(4);
  else if (national.startsWith("00971")) national = national.slice(5);
  else if (national.startsWith("971")) national = national.slice(3);
  else if (national.startsWith("0")) national = national.slice(1);

  if (!/^5\d{8}$/.test(national)) return null;
  return `+971${national}`;
}
