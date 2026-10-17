export type PermissionKey =
  | "view_products"
  | "manage_products"
  | "edit_orders"
  | "access_reports"
  | "manage_customers"
  | "manage_marketing"
  | "manage_users"
  | "manage_settings"

export type UserRoleType = "ADMIN" | "MANAGER" | "EDITOR" | "SUPPORT" | "USER"

export interface UserPermissionRecord {
  userId: string
  roleLabel: UserRoleType
  permissions: PermissionKey[]
  updatedAt: string
}

export const ALL_PERMISSIONS: PermissionKey[] = [
  "view_products",
  "manage_products",
  "edit_orders",
  "access_reports",
  "manage_customers",
  "manage_marketing",
  "manage_users",
  "manage_settings",
]

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRoleType, PermissionKey[]> = {
  ADMIN: [...ALL_PERMISSIONS],
  MANAGER: [
    "view_products",
    "manage_products",
    "edit_orders",
    "access_reports",
    "manage_customers",
    "manage_marketing",
  ],
  EDITOR: ["view_products", "manage_products", "manage_marketing"],
  SUPPORT: ["view_products", "edit_orders", "manage_customers"],
  USER: ["view_products"],
}
