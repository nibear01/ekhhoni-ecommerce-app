import type { UserRole } from "../db/schema.js";
import { getEnv } from "./env.js";

export const ROLES: readonly UserRole[] = ["customer", "support", "admin"];

export function parseRole(value: unknown): UserRole {
  if (typeof value === "string" && (ROLES as readonly string[]).includes(value)) {
    return value as UserRole;
  }
  return "customer";
}

/** true when the email is listed in ADMIN_EMAILS */
export function isBootstrapAdmin(email: string | null | undefined) {
  if (!email) return false;
  const list = (getEnv().ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/** role from Clerk public metadata; ADMIN_EMAILS upgrades an otherwise-customer account to admin */
export function resolveRole(metadataRole: unknown, email: string | null | undefined): UserRole {
  const role = parseRole(metadataRole);
  return role === "customer" && isBootstrapAdmin(email) ? "admin" : role;
}

export function isAdmin(role: UserRole) {
  return role === "admin";
}

export function isStaff(role: UserRole) {
  return role === "support" || role === "admin";
}
