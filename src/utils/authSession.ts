/** Minimal role normalizer for invoice/sales permission checks. */
export const normalizeRoleKey = (role?: string | null): string =>
  String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

export const INVOICE_OFFICER_ROLE = "invoice_officer";

export const isInvoiceOfficerRole = (role?: string | null): boolean =>
  normalizeRoleKey(role) === INVOICE_OFFICER_ROLE;

type SessionUserLike = {
  role?: {
    role?: string | null;
    permissions?: Array<{ action?: string; subject?: string }>;
  };
  agentDetails?: unknown;
} | null | undefined;

const INVOICE_SEND_ROLE_KEYS = new Set([
  "tenant_admin",
  "admin",
  "super_admin",
  "super-admin",
  INVOICE_OFFICER_ROLE,
  "assignedagent",
]);

/** Staff with invoice/sales roles or sales agents may email invoices/receipts to customers. */
export const canSendInvoiceToCustomer = (userData: SessionUserLike): boolean => {
  const roleKey = normalizeRoleKey(userData?.role?.role);
  if (INVOICE_SEND_ROLE_KEYS.has(roleKey)) {
    return true;
  }
  return Boolean(userData?.agentDetails);
};

export const getSaleCustomerEmail = (saleData?: {
  customer?: { email?: string | null };
} | null): string | undefined => {
  const email = saleData?.customer?.email?.trim();
  return email || undefined;
};

export const isAssignedAgentUser = (userData: SessionUserLike): boolean =>
  normalizeRoleKey(userData?.role?.role) === "assignedagent" ||
  Boolean(userData?.agentDetails);

export const isInstallerAgentUser = (
  userData: SessionUserLike & { agentDetails?: { category?: string } },
): boolean =>
  String(userData?.agentDetails?.category ?? "").toUpperCase() === "INSTALLER";

/** Profile route for Settings (admin vs agent vs installer). */
export const getSettingsProfilePath = (
  userData: SessionUserLike & { agentDetails?: { category?: string } },
): string => {
  if (isInstallerAgentUser(userData)) return "/installer/settings/profile";
  if (isAssignedAgentUser(userData)) return "/agent/settings/profile";
  return "/settings/profile";
};

/** Staff (non-agent) with admin role or AuditLog read permission. */
export const canAccessAuditLogs = (userData: SessionUserLike): boolean => {
  if (isAssignedAgentUser(userData) || isInstallerAgentUser(userData)) {
    return false;
  }
  const roleKey = normalizeRoleKey(userData?.role?.role);
  if (
    roleKey === "admin" ||
    roleKey === "super_admin" ||
    roleKey === "super-admin"
  ) {
    return true;
  }
  const permissions = userData?.role?.permissions as
    | Array<{ action?: string; subject?: string }>
    | undefined;
  return (
    permissions?.some(
      (p) =>
        p.subject === "AuditLog" &&
        (p.action === "read" || p.action === "manage"),
    ) ?? false
  );
};

/** Configure invoice page — tenant admins / invoice officers only (not agents). */
export const canAccessInvoiceSettings = (userData: SessionUserLike): boolean => {
  if (isAssignedAgentUser(userData)) return false;
  const roleKey = normalizeRoleKey(userData?.role?.role);
  return (
    roleKey === "admin" ||
    roleKey === "super_admin" ||
    roleKey === "super-admin" ||
    roleKey === "tenant_admin" ||
    roleKey === INVOICE_OFFICER_ROLE
  );
};
