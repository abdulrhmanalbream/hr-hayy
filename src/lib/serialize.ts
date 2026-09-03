import { Prisma } from "@prisma/client";

/**
 * Deep-converts Prisma `Decimal` values to plain strings so query results can
 * cross the Server Component -> Client Component boundary (React's flight
 * serializer rejects non-plain objects like Decimal, though it accepts Date).
 */
export function serialize<T>(value: T): T {
  if (value instanceof Prisma.Decimal) return value.toString() as unknown as T;
  if (Array.isArray(value)) return value.map((v) => serialize(v)) as unknown as T;
  if (value instanceof Date) return value;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = serialize(v);
    return out as T;
  }
  return value;
}
