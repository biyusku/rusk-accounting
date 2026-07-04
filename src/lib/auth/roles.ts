/**
 * Rol ve izin tanımları.
 * Her rol hangi kaynaklara erişebilir?
 */

export type UserRole = "admin" | "manager" | "accountant" | "viewer";

export interface Permission {
  resource: string;
  actions: ("read" | "write" | "delete")[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: "*", actions: ["read", "write", "delete"] },
  ],
  manager: [
    { resource: "accounts", actions: ["read", "write"] },
    { resource: "transactions", actions: ["read", "write", "delete"] },
    { resource: "invoices", actions: ["read", "write", "delete"] },
    { resource: "budgets", actions: ["read", "write"] },
    { resource: "reports", actions: ["read"] },
  ],
  accountant: [
    { resource: "transactions", actions: ["read", "write"] },
    { resource: "invoices", actions: ["read", "write"] },
    { resource: "reports", actions: ["read"] },
    { resource: "accounts", actions: ["read"] },
  ],
  viewer: [
    { resource: "accounts", actions: ["read"] },
    { resource: "transactions", actions: ["read"] },
    { resource: "invoices", actions: ["read"] },
    { resource: "reports", actions: ["read"] },
    { resource: "budgets", actions: ["read"] },
  ],
};

export function hasPermission(
  role: UserRole,
  resource: string,
  action: "read" | "write" | "delete"
): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  // admin joker
  const wildcard = perms.find((p) => p.resource === "*");
  if (wildcard) return true;

  const perm = perms.find((p) => p.resource === resource);
  return perm?.actions.includes(action) ?? false;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Yönetici",
  manager: "Müdür",
  accountant: "Muhasebeci",
  viewer: "Görüntüleyici",
};