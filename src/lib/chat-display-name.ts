export function chatDisplayName(name: unknown): string {
  if (typeof name !== "string" || !name.trim() || name.includes("@")) return "Fan";
  return name.trim().slice(0, 40);
}