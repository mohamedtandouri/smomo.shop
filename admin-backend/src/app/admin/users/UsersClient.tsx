"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  Edit,
  Trash2,
  CheckCircle2,
  Ban,
  Mail,
  Phone,
  Lock,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Megaphone,
  UserCog,
  Eye,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  Sparkles,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ManagedUserItem,
  createUserWithPermissionsAction,
  updateUserAndPermissionsAction,
  toggleUserAccountStatusAction,
  deleteManagedUserAction,
} from "@/app/actions/users"
import {
  PermissionKey,
  UserRoleType,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
} from "@/lib/permissions-config"
import { useLocaleStore, LanguageCode } from "@/store/useLocaleStore"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Bilingual / Multi-language dictionary (ar, en, fr) for User Management & Permissions Matrix
const USERS_I18N: Record<
  LanguageCode,
  {
    pageTitle: string
    pageSubtitle: string
    addNewUser: string
    totalUsers: string
    adminsAndStaff: string
    activeAccounts: string
    suspendedAccounts: string
    searchPlaceholder: string
    filterLabel: string
    allRoles: string
    allStatuses: string
    statusActive: string
    statusSuspended: string
    colUser: string
    colRole: string
    colPermissions: string
    colStatus: string
    colActions: string
    fullAccessBadge: (count: number) => string
    morePermissions: (count: number) => string
    editBtn: string
    suspendTooltip: string
    activateTooltip: string
    deleteTooltip: string
    emptyUsers: string
    modalCreateTitle: string
    modalEditTitle: (name: string) => string
    modalCreateDesc: string
    modalEditDesc: string
    labelFullName: string
    placeholderFullName: string
    labelEmail: string
    placeholderEmail: string
    labelRole: string
    labelStatus: string
    labelPhone: string
    labelPasswordCreate: string
    labelPasswordEdit: string
    placeholderPasswordCreate: string
    placeholderPasswordEdit: string
    permissionsSectionTitle: string
    permissionsSectionDesc: string
    selectAllPermissions: string
    deselectAllPermissions: string
    cancelBtn: string
    savingBtn: string
    saveEditBtn: string
    saveCreateBtn: string
    deleteModalTitle: string
    deleteModalDescPrefix: string
    deleteModalDescSuffix: string
    confirmDeleteBtn: string
    valNameMin: string
    valNameMax: string
    valEmailReq: string
    valEmailInvalid: string
    valPhoneMax: string
    valPasswordMin: string
    valPermissionsMin: string
    toastUpdated: string
    toastUpdateFailed: string
    toastCreated: string
    toastCreateFailed: string
    toastUnexpected: string
    toastActivated: (name: string) => string
    toastSuspended: (name: string) => string
    toastStatusError: string
    toastDeleted: string
    toastDeleteError: string
    roles: Record<UserRoleType, string>
    permissions: Record<PermissionKey, { label: string; description: string }>
  }
> = {
  ar: {
    pageTitle: "إدارة المستخدمين والصلاحيات",
    pageSubtitle:
      "إدارة حسابات المشرفين والمستخدمين وتخصيص مصفوفة صلاحيات الوصول لكل مستخدم",
    addNewUser: "إضافة مستخدم جديد",
    totalUsers: "إجمالي المستخدمين",
    adminsAndStaff: "المدراء والمشرفون",
    activeAccounts: "الحسابات النشطة",
    suspendedAccounts: "الحسابات الموقوفة",
    searchPlaceholder: "بحث بالاسم، البريد الإلكتروني، أو الهاتف...",
    filterLabel: "تصفية:",
    allRoles: "جميع الأدوار",
    allStatuses: "جميع الحالات",
    statusActive: "نشط",
    statusSuspended: "موقوف",
    colUser: "المستخدم",
    colRole: "الدور",
    colPermissions: "الصلاحيات الممنوحة",
    colStatus: "الحالة",
    colActions: "الإجراءات",
    fullAccessBadge: (count) => `كامل الصلاحيات (${count})`,
    morePermissions: (count) => `+${count} صلاحيات أخرى`,
    editBtn: "تعديل",
    suspendTooltip: "إيقاف الحساب",
    activateTooltip: "تفعيل الحساب",
    deleteTooltip: "حذف المستخدم",
    emptyUsers: "لا يوجد مستخدمون مطابقون لمعايير البحث الحالية.",
    modalCreateTitle: "إضافة مستخدم جديد",
    modalEditTitle: (name) => `تعديل المستخدم والصلاحيات: ${name}`,
    modalCreateDesc:
      "أدخل بيانات المستخدم الجديد وحدد صلاحيات الوصول المسموحة له في لوحة التحكم.",
    modalEditDesc:
      "قم بتحديث البيانات الأساسية وتخصيص مصفوفة صلاحيات الوصول الخاصة بالمستخدم.",
    labelFullName: "الاسم الكامل",
    placeholderFullName: "مثال: أحمد المنصوري",
    labelEmail: "البريد الإلكتروني",
    placeholderEmail: "user@smomo.shop",
    labelRole: "الدور الوظيفي",
    labelStatus: "حالة الحساب",
    labelPhone: "رقم الهاتف (اختياري)",
    labelPasswordCreate: "كلمة المرور",
    labelPasswordEdit: "كلمة مرور جديدة (اختياري)",
    placeholderPasswordCreate: "8 أحرف على الأقل",
    placeholderPasswordEdit: "اتركه فارغاً للإبقاء على الحالية",
    permissionsSectionTitle: "نظام الصلاحيات (Permissions Matrix)",
    permissionsSectionDesc:
      "حدد الصلاحيات المسموح للمستخدم الوصول إليها وإدارتها داخل النظام",
    selectAllPermissions: "تحديد جميع الصلاحيات",
    deselectAllPermissions: "إلغاء تحديد الكل",
    cancelBtn: "إلغاء",
    savingBtn: "جاري الحفظ...",
    saveEditBtn: "حفظ التعديلات والصلاحيات",
    saveCreateBtn: "إضافة المستخدم وتعيين الصلاحيات",
    deleteModalTitle: "تأكيد حذف المستخدم",
    deleteModalDescPrefix: "هل أنت متأكد من رغبتك في حذف حساب المستخدم",
    deleteModalDescSuffix:
      "؟ لا يمكن التراجع عن هذا الإجراء وسيتم إلغاء جميع صلاحياته فوراً.",
    confirmDeleteBtn: "نعم، حذف المستخدم",
    valNameMin: "الاسم الكامل يجب أن يتكون من حرفين على الأقل",
    valNameMax: "الاسم طويل جداً",
    valEmailReq: "البريد الإلكتروني مطلوب",
    valEmailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
    valPhoneMax: "رقم الهاتف طويل جداً",
    valPasswordMin: "كلمة المرور يجب ألا تقل عن 8 أحرف",
    valPermissionsMin: "يرجى تحديد صلاحية واحدة على الأقل من مصفوفة الصلاحيات",
    toastUpdated: "تم تحديث بيانات وصلاحيات المستخدم بنجاح!",
    toastUpdateFailed: "فشل تحديث المستخدم.",
    toastCreated: "تم إضافة المستخدم الجديد وتعيين صلاحياته بنجاح!",
    toastCreateFailed: "فشل إضافة المستخدم الجديد.",
    toastUnexpected: "حدث خطأ غير متوقع أثناء حفظ بيانات المستخدم.",
    toastActivated: (name) => `تم تفعيل حساب «${name}» بنجاح`,
    toastSuspended: (name) => `تم إيقاف حساب «${name}» مؤقتاً`,
    toastStatusError: "تعذر تغيير حالة الحساب.",
    toastDeleted: "تم حذف المستخدم بنجاح",
    toastDeleteError: "فشل حذف المستخدم",
    roles: {
      ADMIN: "مدير النظام (Admin)",
      MANAGER: "مشرف المتجر (Manager)",
      EDITOR: "محرر منتجات (Editor)",
      SUPPORT: "مسؤول الطلبات والدعم (Support)",
      USER: "مستخدم (User)",
    },
    permissions: {
      view_products: {
        label: "عرض المنتجات",
        description: "استعراض المنتجات، الأسعار، التصنيفات، ومستويات المخزون",
      },
      edit_orders: {
        label: "تعديل الطلبات",
        description: "إدارة طلبات العملاء، تحديث حالات الشحن، وإصدار الفواتير",
      },
      access_reports: {
        label: "الوصول للتقارير",
        description: "الاطلاع على التحليلات المالية، تقارير المبيعات، ومؤشرات الأداء",
      },
      manage_settings: {
        label: "إدارة الإعدادات",
        description: "التحكم في إعدادات المتجر العامة، القوالب، اللغات، والعملات",
      },
      manage_products: {
        label: "إدارة المنتجات والمخزون",
        description: "إضافة منتجات جديدة، تعديل الأسعار، وإجراء جرد المخزون",
      },
      manage_customers: {
        label: "إدارة العملاء",
        description: "عرض قاعدة بيانات العملاء وسجل المشتريات والعربات المهجورة",
      },
      manage_marketing: {
        label: "إدارة التسويق والكوبونات",
        description: "إنشاء كوبونات الخصم، عروض البيع الإضافي، ومسارات التحويل",
      },
      manage_users: {
        label: "إدارة المستخدمين والصلاحيات",
        description: "إضافة مستخدمين جدد وتخصيص الأدوار ومصفوفة الصلاحيات",
      },
    },
  },
  en: {
    pageTitle: "User & Permissions Management",
    pageSubtitle:
      "Manage administrator and staff accounts and customize the access permissions matrix for each user",
    addNewUser: "Add New User",
    totalUsers: "Total Users",
    adminsAndStaff: "Admins & Staff",
    activeAccounts: "Active Accounts",
    suspendedAccounts: "Suspended Accounts",
    searchPlaceholder: "Search by name, email, or phone...",
    filterLabel: "Filter:",
    allRoles: "All Roles",
    allStatuses: "All Statuses",
    statusActive: "Active",
    statusSuspended: "Suspended",
    colUser: "User",
    colRole: "Role",
    colPermissions: "Granted Permissions",
    colStatus: "Status",
    colActions: "Actions",
    fullAccessBadge: (count) => `Full Access (${count})`,
    morePermissions: (count) => `+${count} more`,
    editBtn: "Edit",
    suspendTooltip: "Suspend Account",
    activateTooltip: "Activate Account",
    deleteTooltip: "Delete User",
    emptyUsers: "No users match your current search or filter criteria.",
    modalCreateTitle: "Add New User",
    modalEditTitle: (name) => `Edit User & Permissions: ${name}`,
    modalCreateDesc:
      "Enter the new user's basic information and assign their allowed dashboard permissions.",
    modalEditDesc:
      "Update the user's account details and customize their access permissions matrix.",
    labelFullName: "Full Name",
    placeholderFullName: "e.g., Alex Morgan",
    labelEmail: "Email Address",
    placeholderEmail: "user@smomo.shop",
    labelRole: "Role",
    labelStatus: "Account Status",
    labelPhone: "Phone Number (Optional)",
    labelPasswordCreate: "Password",
    labelPasswordEdit: "New Password (Optional)",
    placeholderPasswordCreate: "At least 8 characters",
    placeholderPasswordEdit: "Leave blank to keep current password",
    permissionsSectionTitle: "Permissions Matrix",
    permissionsSectionDesc:
      "Select the modules and actions this user is authorized to access",
    selectAllPermissions: "Select All Permissions",
    deselectAllPermissions: "Deselect All",
    cancelBtn: "Cancel",
    savingBtn: "Saving...",
    saveEditBtn: "Save Changes & Permissions",
    saveCreateBtn: "Add User & Assign Permissions",
    deleteModalTitle: "Confirm User Deletion",
    deleteModalDescPrefix: "Are you sure you want to delete the account for",
    deleteModalDescSuffix:
      "? This action cannot be undone and will immediately revoke all permissions.",
    confirmDeleteBtn: "Yes, Delete User",
    valNameMin: "Full name must be at least 2 characters",
    valNameMax: "Name is too long",
    valEmailReq: "Email address is required",
    valEmailInvalid: "Please enter a valid email address",
    valPhoneMax: "Phone number is too long",
    valPasswordMin: "Password must be at least 8 characters",
    valPermissionsMin: "Please select at least one permission from the matrix",
    toastUpdated: "User details and permissions updated successfully!",
    toastUpdateFailed: "Failed to update user.",
    toastCreated: "New user created and permissions assigned successfully!",
    toastCreateFailed: "Failed to create new user.",
    toastUnexpected: "An unexpected error occurred while saving user data.",
    toastActivated: (name) => `Account "${name}" activated successfully`,
    toastSuspended: (name) => `Account "${name}" suspended`,
    toastStatusError: "Failed to update account status.",
    toastDeleted: "User deleted successfully",
    toastDeleteError: "Failed to delete user",
    roles: {
      ADMIN: "System Admin",
      MANAGER: "Store Manager",
      EDITOR: "Product Editor",
      SUPPORT: "Order & Support Agent",
      USER: "Standard User",
    },
    permissions: {
      view_products: {
        label: "View Products",
        description: "Browse products, pricing, categories, and stock levels",
      },
      edit_orders: {
        label: "Edit Orders",
        description: "Manage customer orders, update shipping status, and issue invoices",
      },
      access_reports: {
        label: "Access Reports",
        description: "View financial analytics, sales reports, and KPI metrics",
      },
      manage_settings: {
        label: "Manage Settings",
        description: "Control general store settings, themes, languages, and currencies",
      },
      manage_products: {
        label: "Manage Products & Inventory",
        description: "Create new products, edit prices, and perform stock audits",
      },
      manage_customers: {
        label: "Manage Customers",
        description: "View customer database, purchase history, and abandoned carts",
      },
      manage_marketing: {
        label: "Manage Marketing & Coupons",
        description: "Create discount coupons, upsell offers, and conversion funnels",
      },
      manage_users: {
        label: "Manage Users & Permissions",
        description: "Add new users and customize roles and permissions matrix",
      },
    },
  },
  fr: {
    pageTitle: "Gestion des Utilisateurs et Permissions",
    pageSubtitle:
      "Gérez les comptes administrateurs et personnalisez la matrice des droits d'accès de chaque utilisateur",
    addNewUser: "Nouvel Utilisateur",
    totalUsers: "Total Utilisateurs",
    adminsAndStaff: "Admins & Équipe",
    activeAccounts: "Comptes Actifs",
    suspendedAccounts: "Comptes Suspendus",
    searchPlaceholder: "Rechercher par nom, e-mail ou téléphone...",
    filterLabel: "Filtrer :",
    allRoles: "Tous les rôles",
    allStatuses: "Tous les statuts",
    statusActive: "Actif",
    statusSuspended: "Suspendu",
    colUser: "Utilisateur",
    colRole: "Rôle",
    colPermissions: "Permissions Accordées",
    colStatus: "Statut",
    colActions: "Actions",
    fullAccessBadge: (count) => `Accès Complet (${count})`,
    morePermissions: (count) => `+${count} autres`,
    editBtn: "Modifier",
    suspendTooltip: "Suspendre le compte",
    activateTooltip: "Activer le compte",
    deleteTooltip: "Supprimer l'utilisateur",
    emptyUsers: "Aucun utilisateur ne correspond à vos critères de recherche.",
    modalCreateTitle: "Ajouter un Nouvel Utilisateur",
    modalEditTitle: (name) => `Modifier l'utilisateur et les permissions : ${name}`,
    modalCreateDesc:
      "Saisissez les informations de l'utilisateur et définissez ses autorisations d'accès.",
    modalEditDesc:
      "Mettez à jour les informations du compte et personnalisez sa matrice de permissions.",
    labelFullName: "Nom Complet",
    placeholderFullName: "ex: Jean Dupont",
    labelEmail: "Adresse E-mail",
    placeholderEmail: "user@smomo.shop",
    labelRole: "Rôle",
    labelStatus: "Statut du Compte",
    labelPhone: "Téléphone (Optionnel)",
    labelPasswordCreate: "Mot de passe",
    labelPasswordEdit: "Nouveau mot de passe (Optionnel)",
    placeholderPasswordCreate: "8 caractères minimum",
    placeholderPasswordEdit: "Laisser vide pour conserver l'actuel",
    permissionsSectionTitle: "Système de Permissions (Matrice)",
    permissionsSectionDesc:
      "Sélectionnez les fonctionnalités auxquelles cet utilisateur peut accéder",
    selectAllPermissions: "Tout sélectionner",
    deselectAllPermissions: "Tout désélectionner",
    cancelBtn: "Annuler",
    savingBtn: "Enregistrement...",
    saveEditBtn: "Enregistrer les modifications",
    saveCreateBtn: "Ajouter et attribuer les permissions",
    deleteModalTitle: "Confirmer la suppression",
    deleteModalDescPrefix: "Êtes-vous sûr de vouloir supprimer le compte de",
    deleteModalDescSuffix:
      " ? Cette action est irréversible et révoquera immédiatement ses accès.",
    confirmDeleteBtn: "Oui, supprimer",
    valNameMin: "Le nom complet doit comporter au moins 2 caractères",
    valNameMax: "Le nom est trop long",
    valEmailReq: "L'adresse e-mail est requise",
    valEmailInvalid: "Veuillez saisir une adresse e-mail valide",
    valPhoneMax: "Le numéro de téléphone est trop long",
    valPasswordMin: "Le mot de passe doit contenir au moins 8 caractères",
    valPermissionsMin: "Veuillez sélectionner au moins une permission",
    toastUpdated: "Utilisateur et permissions mis à jour avec succès !",
    toastUpdateFailed: "Échec de la mise à jour.",
    toastCreated: "Nouvel utilisateur créé avec succès !",
    toastCreateFailed: "Échec de la création de l'utilisateur.",
    toastUnexpected: "Une erreur inattendue s'est produite.",
    toastActivated: (name) => `Compte « ${name} » activé avec succès`,
    toastSuspended: (name) => `Compte « ${name} » suspendu`,
    toastStatusError: "Impossible de modifier le statut du compte.",
    toastDeleted: "Utilisateur supprimé avec succès",
    toastDeleteError: "Échec de la suppression",
    roles: {
      ADMIN: "Administrateur (Admin)",
      MANAGER: "Responsable Boutique (Manager)",
      EDITOR: "Éditeur Produits (Editor)",
      SUPPORT: "Support & Commandes (Support)",
      USER: "Utilisateur (User)",
    },
    permissions: {
      view_products: {
        label: "Voir les produits",
        description: "Consulter les produits, prix, catégories et niveaux de stock",
      },
      edit_orders: {
        label: "Modifier les commandes",
        description: "Gérer les commandes clients, livraisons et factures",
      },
      access_reports: {
        label: "Accéder aux rapports",
        description: "Consulter les analyses financières et rapports de ventes",
      },
      manage_settings: {
        label: "Gérer les paramètres",
        description: "Configurer la boutique, les thèmes, langues et devises",
      },
      manage_products: {
        label: "Gérer produits et stock",
        description: "Ajouter des produits, modifier les prix et gérer l'inventaire",
      },
      manage_customers: {
        label: "Gérer les clients",
        description: "Consulter la base clients et les paniers abandonnés",
      },
      manage_marketing: {
        label: "Gérer le marketing",
        description: "Créer des coupons, offres incitatives et tunnels de vente",
      },
      manage_users: {
        label: "Gérer les utilisateurs",
        description: "Ajouter des utilisateurs et configurer les permissions",
      },
    },
  },
}

const PERMISSION_META_CONFIG: {
  key: PermissionKey
  icon: React.ElementType
  badgeColor: string
}[] = [
  {
    key: "view_products",
    icon: Eye,
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    key: "edit_orders",
    icon: ShoppingBag,
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    key: "access_reports",
    icon: BarChart3,
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    key: "manage_settings",
    icon: Settings,
    badgeColor: "bg-rose-500/10 text-primary border-primary/20",
  },
  {
    key: "manage_products",
    icon: Package,
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    key: "manage_customers",
    icon: Users,
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  {
    key: "manage_marketing",
    icon: Megaphone,
    badgeColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  {
    key: "manage_users",
    icon: UserCog,
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
]

const ROLE_BADGE_CLASSES: Record<UserRoleType, string> = {
  ADMIN: "bg-primary/10 text-primary border-primary/25",
  MANAGER: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
  EDITOR: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
  SUPPORT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  USER: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25",
}

const ROLE_VALUES: UserRoleType[] = ["ADMIN", "MANAGER", "EDITOR", "SUPPORT", "USER"]

interface UsersClientProps {
  initialUsers: ManagedUserItem[]
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const { language, direction } = useLocaleStore()
  const isRtl = direction === "rtl"
  const copy = USERS_I18N[language] || USERS_I18N.en

  const [users, setUsers] = useState<ManagedUserItem[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Modal state (Add / Edit User & Permissions)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUserItem | null>(null)

  // Delete confirmation modal state
  const [userToDelete, setUserToDelete] = useState<ManagedUserItem | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const userModalFormSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, copy.valNameMin).max(80, copy.valNameMax),
        email: z
          .string()
          .trim()
          .min(1, copy.valEmailReq)
          .email(copy.valEmailInvalid),
        phone: z
          .string()
          .trim()
          .max(30, copy.valPhoneMax)
          .optional()
          .or(z.literal("")),
        role: z.enum(["ADMIN", "MANAGER", "EDITOR", "SUPPORT", "USER"]),
        status: z.enum(["ACTIVE", "SUSPENDED"]),
        password: z
          .string()
          .refine((val) => !val || val.length >= 8, copy.valPasswordMin)
          .optional()
          .or(z.literal("")),
        permissions: z
          .array(
            z.enum([
              "view_products",
              "manage_products",
              "edit_orders",
              "access_reports",
              "manage_customers",
              "manage_marketing",
              "manage_users",
              "manage_settings",
            ])
          )
          .min(1, copy.valPermissionsMin),
      }),
    [copy]
  )

  type UserModalFormValues = z.infer<typeof userModalFormSchema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserModalFormValues>({
    resolver: zodResolver(userModalFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "MANAGER",
      status: "ACTIVE",
      password: "",
      permissions: ["view_products", "edit_orders", "access_reports"],
    },
  })

  const selectedPermissions = watch("permissions") || []
  const selectedRole = watch("role")
  const selectedStatus = watch("status")

  // Quick KPI stats
  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.status === "ACTIVE").length
    const suspended = users.filter((u) => u.status === "SUSPENDED").length
    const adminsAndStaff = users.filter((u) => u.role !== "USER").length
    return { total, active, suspended, adminsAndStaff }
  }, [users])

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery))
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter
      const matchesStatus = statusFilter === "ALL" || u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const openCreateModal = () => {
    setEditingUser(null)
    reset({
      name: "",
      email: "",
      phone: "",
      role: "MANAGER",
      status: "ACTIVE",
      password: "",
      permissions: ["view_products", "edit_orders", "access_reports"],
    })
    setModalOpen(true)
  }

  const openEditModal = (user: ManagedUserItem) => {
    setEditingUser(user)
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      status: user.status,
      password: "",
      permissions:
        user.permissions && user.permissions.length > 0
          ? user.permissions
          : ROLE_DEFAULT_PERMISSIONS[user.role] || ["view_products"],
    })
    setModalOpen(true)
  }

  const togglePermission = (permKey: PermissionKey) => {
    const current = new Set(selectedPermissions)
    if (current.has(permKey)) {
      current.delete(permKey)
    } else {
      current.add(permKey)
    }
    setValue("permissions", Array.from(current), {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === ALL_PERMISSIONS.length) {
      setValue("permissions", ["view_products"], { shouldValidate: true })
    } else {
      setValue("permissions", [...ALL_PERMISSIONS], { shouldValidate: true })
    }
  }

  const handleRoleChange = (newRole: UserRoleType) => {
    setValue("role", newRole, { shouldValidate: true })
    setValue(
      "permissions",
      [...(ROLE_DEFAULT_PERMISSIONS[newRole] || ["view_products"])],
      {
        shouldValidate: true,
      }
    )
  }

  const onSubmitModal = async (values: UserModalFormValues) => {
    try {
      if (editingUser) {
        const res = await updateUserAndPermissionsAction(editingUser.id, {
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          role: values.role,
          status: values.status,
          password: values.password || undefined,
          permissions: values.permissions,
        })

        if (res.success && res.user) {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? res.user! : u))
          )
          toast.success(copy.toastUpdated)
          setModalOpen(false)
          setEditingUser(null)
        } else {
          toast.error(res.error || copy.toastUpdateFailed)
        }
      } else {
        const res = await createUserWithPermissionsAction({
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          role: values.role,
          status: values.status,
          password: values.password || undefined,
          permissions: values.permissions,
        })

        if (res.success && res.user) {
          setUsers((prev) => [res.user!, ...prev])
          toast.success(copy.toastCreated)
          setModalOpen(false)
        } else {
          toast.error(res.error || copy.toastCreateFailed)
        }
      }
    } catch {
      toast.error(copy.toastUnexpected)
    }
  }

  const handleToggleStatus = async (user: ManagedUserItem) => {
    setProcessingId(user.id)
    try {
      const res = await toggleUserAccountStatusAction(user.id, user.status)
      if (res.success && res.status) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, status: res.status! } : u
          )
        )
        toast.success(
          res.status === "ACTIVE"
            ? copy.toastActivated(user.name)
            : copy.toastSuspended(user.name)
        )
      } else {
        toast.error(res.error || copy.toastStatusError)
      }
    } finally {
      setProcessingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    setProcessingId(userToDelete.id)
    try {
      const res = await deleteManagedUserAction(userToDelete.id)
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
        toast.success(copy.toastDeleted)
        setUserToDelete(null)
      } else {
        toast.error(res.error || copy.toastDeleteError)
      }
    } finally {
      setProcessingId(null)
    }
  }

  const getRoleBadge = (role: UserRoleType) => {
    const badgeClass = ROLE_BADGE_CLASSES[role] || ROLE_BADGE_CLASSES.USER
    const label = copy.roles[role] || copy.roles.USER
    return (
      <Badge
        variant="outline"
        className={cn("font-semibold text-[11px] px-2.5 py-0.5 gap-1", badgeClass)}
      >
        <Shield className="h-3 w-3" />
        <span>{label}</span>
      </Badge>
    )
  }

  const getPermissionMeta = (key: PermissionKey) => {
    const base = PERMISSION_META_CONFIG.find((p) => p.key === key)
    if (!base) return null
    const text = copy.permissions[key]
    return {
      ...base,
      label: text?.label || key,
      description: text?.description || "",
    }
  }

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "US"
    )
  }

  return (
    <div className="space-y-6 pb-10 font-sans" dir={direction}>
      {/* Page Header & Add User CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {copy.pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {copy.pageSubtitle}
            </p>
          </div>
        </div>

        <Button
          onClick={openCreateModal}
          className="gap-2 bg-primary hover:bg-[#be123c] text-white h-10 px-5 rounded-xl font-semibold shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>{copy.addNewUser}</span>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 bg-card shadow-2xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {copy.totalUsers}
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-2xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {copy.adminsAndStaff}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {stats.adminsAndStaff}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-2xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {copy.activeAccounts}
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.active}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-2xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {copy.suspendedAccounts}
              </p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.suspended}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Ban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table Card */}
      <Card className="border border-border/80 bg-card shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 bg-muted/20 border-b border-border/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search
                className={cn(
                  "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                  isRtl ? "right-3" : "left-3"
                )}
              />
              <Input
                type="search"
                placeholder={copy.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-9 bg-background rounded-xl text-xs sm:text-sm",
                  isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                )}
              />
            </div>

            {/* Role & Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span>{copy.filterLabel}</span>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">{copy.allRoles}</option>
                {ROLE_VALUES.map((r) => (
                  <option key={r} value={r}>
                    {copy.roles[r]}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">{copy.allStatuses}</option>
                <option value="ACTIVE">{copy.statusActive}</option>
                <option value="SUSPENDED">{copy.statusSuspended}</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead
                    className={cn("font-bold", isRtl ? "text-right" : "text-left")}
                  >
                    {copy.colUser}
                  </TableHead>
                  <TableHead
                    className={cn("font-bold", isRtl ? "text-right" : "text-left")}
                  >
                    {copy.colRole}
                  </TableHead>
                  <TableHead
                    className={cn("font-bold", isRtl ? "text-right" : "text-left")}
                  >
                    {copy.colPermissions}
                  </TableHead>
                  <TableHead
                    className={cn("font-bold", isRtl ? "text-right" : "text-left")}
                  >
                    {copy.colStatus}
                  </TableHead>
                  <TableHead
                    className={cn("font-bold", isRtl ? "text-left" : "text-right")}
                  >
                    {copy.colActions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        user.status === "SUSPENDED" && "opacity-75 bg-muted/10"
                      )}
                    >
                      {/* User Name & Email */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 shrink-0">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">
                              {user.name}
                            </p>
                            <p
                              className="text-xs text-muted-foreground truncate font-mono"
                              dir="ltr"
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell className="py-3.5">{getRoleBadge(user.role)}</TableCell>

                      {/* Permissions Badges */}
                      <TableCell className="py-3.5 max-w-md">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {user.permissions.length === ALL_PERMISSIONS.length ? (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/25 text-[11px] font-semibold gap-1"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>
                                {copy.fullAccessBadge(ALL_PERMISSIONS.length)}
                              </span>
                            </Badge>
                          ) : (
                            <>
                              {user.permissions.slice(0, 3).map((permKey) => {
                                const meta = getPermissionMeta(permKey)
                                if (!meta) return null
                                return (
                                  <span
                                    key={permKey}
                                    className={cn(
                                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                                      meta.badgeColor
                                    )}
                                  >
                                    <span>{meta.label}</span>
                                  </span>
                                )
                              })}
                              {user.permissions.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => openEditModal(user)}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border transition-colors cursor-pointer"
                                >
                                  {copy.morePermissions(
                                    user.permissions.length - 3
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        {user.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>{copy.statusActive}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>{copy.statusSuspended}</span>
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell
                        className={cn(
                          "py-3.5",
                          isRtl ? "text-left" : "text-right"
                        )}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="h-8 px-3 text-xs font-semibold border-border/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary rounded-lg gap-1.5 cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 text-primary" />
                            <span>{copy.editBtn}</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggleStatus(user)}
                            disabled={processingId === user.id}
                            title={
                              user.status === "ACTIVE"
                                ? copy.suspendTooltip
                                : copy.activateTooltip
                            }
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {user.status === "ACTIVE" ? (
                              <Ban className="h-4 w-4 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setUserToDelete(user)}
                            disabled={processingId === user.id}
                            title={copy.deleteTooltip}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium">{copy.emptyUsers}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit User & Permissions Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl"
          dir={direction}
        >
          <div
            className={cn(
              "p-6 border-b border-border/60",
              isRtl
                ? "bg-gradient-to-l from-primary/10 via-primary/5 to-transparent"
                : "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
            )}
          >
            <DialogHeader className={isRtl ? "text-right" : "text-left"}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-xs shrink-0">
                  {editingUser ? (
                    <UserCog className="h-5 w-5" />
                  ) : (
                    <UserPlus className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {editingUser
                      ? copy.modalEditTitle(editingUser.name)
                      : copy.modalCreateTitle}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-1">
                    {editingUser ? copy.modalEditDesc : copy.modalCreateDesc}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit(onSubmitModal)}
            className="p-6 space-y-6"
            noValidate
          >
            {/* Basic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-user-name" className="text-xs font-semibold">
                  {copy.labelFullName} <span className="text-primary">*</span>
                </Label>
                <div className="relative">
                  <Users
                    className={cn(
                      "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                      isRtl ? "right-3" : "left-3"
                    )}
                  />
                  <Input
                    id="modal-user-name"
                    type="text"
                    placeholder={copy.placeholderFullName}
                    className={cn(
                      "h-10 rounded-xl",
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3",
                      errors.name && "border-destructive"
                    )}
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-user-email" className="text-xs font-semibold">
                  {copy.labelEmail} <span className="text-primary">*</span>
                </Label>
                <div className="relative">
                  <Mail
                    className={cn(
                      "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                      isRtl ? "right-3" : "left-3"
                    )}
                  />
                  <Input
                    id="modal-user-email"
                    type="email"
                    dir="ltr"
                    placeholder={copy.placeholderEmail}
                    className={cn(
                      "h-10 text-left rounded-xl",
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3",
                      errors.email && "border-destructive"
                    )}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-user-role" className="text-xs font-semibold">
                  {copy.labelRole}
                </Label>
                <select
                  id="modal-user-role"
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRoleType)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {ROLE_VALUES.map((r) => (
                    <option key={r} value={r}>
                      {copy.roles[r]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-user-status" className="text-xs font-semibold">
                  {copy.labelStatus}
                </Label>
                <select
                  id="modal-user-status"
                  value={selectedStatus}
                  onChange={(e) =>
                    setValue("status", e.target.value as "ACTIVE" | "SUSPENDED", {
                      shouldValidate: true,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="ACTIVE">{copy.statusActive}</option>
                  <option value="SUSPENDED">{copy.statusSuspended}</option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-user-phone" className="text-xs font-semibold">
                  {copy.labelPhone}
                </Label>
                <div className="relative">
                  <Phone
                    className={cn(
                      "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                      isRtl ? "right-3" : "left-3"
                    )}
                  />
                  <Input
                    id="modal-user-phone"
                    type="tel"
                    dir="ltr"
                    placeholder="+212 600-000000"
                    className={cn(
                      "h-10 text-left rounded-xl",
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                    )}
                    {...register("phone")}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="modal-user-password"
                  className="text-xs font-semibold"
                >
                  {editingUser ? copy.labelPasswordEdit : copy.labelPasswordCreate}
                </Label>
                <div className="relative">
                  <Lock
                    className={cn(
                      "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                      isRtl ? "right-3" : "left-3"
                    )}
                  />
                  <Input
                    id="modal-user-password"
                    type="password"
                    dir="ltr"
                    placeholder={
                      editingUser
                        ? copy.placeholderPasswordEdit
                        : copy.placeholderPasswordCreate
                    }
                    className={cn(
                      "h-10 text-left rounded-xl",
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3",
                      errors.password && "border-destructive"
                    )}
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Permissions System Matrix */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{copy.permissionsSectionTitle}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {copy.permissionsSectionDesc}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllPermissions}
                  className="h-8 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg gap-1.5 cursor-pointer"
                >
                  {selectedPermissions.length === ALL_PERMISSIONS.length ? (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      <span>{copy.deselectAllPermissions}</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>{copy.selectAllPermissions}</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PERMISSION_META_CONFIG.map((permConfig) => {
                  const Icon = permConfig.icon
                  const isChecked = selectedPermissions.includes(permConfig.key)
                  const permText = copy.permissions[permConfig.key]

                  return (
                    <label
                      key={permConfig.key}
                      onClick={(e) => {
                        e.preventDefault()
                        togglePermission(permConfig.key)
                      }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                        isChecked
                          ? "border-primary bg-primary/5 shadow-2xs"
                          : "border-border/70 bg-muted/20 hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                          isChecked
                            ? "bg-primary border-primary text-white"
                            : "border-muted-foreground/40 bg-background"
                        )}
                      >
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              isChecked ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs font-bold",
                              isChecked ? "text-primary" : "text-foreground"
                            )}
                          >
                            {permText.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                          {permText.description}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>

              {errors.permissions && (
                <p className="text-xs text-destructive flex items-center gap-1.5 font-medium pt-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.permissions.message}</span>
                </p>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 flex flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
                className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {copy.cancelBtn}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-6 rounded-xl bg-primary hover:bg-[#be123c] text-white text-xs font-semibold gap-2 shadow-sm shadow-primary/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingUser ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span>
                  {isSubmitting
                    ? copy.savingBtn
                    : editingUser
                    ? copy.saveEditBtn
                    : copy.saveCreateBtn}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl" dir={direction}>
          <DialogHeader className={isRtl ? "text-right" : "text-left"}>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>{copy.deleteModalTitle}</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-2">
              {copy.deleteModalDescPrefix}{" "}
              <strong className="text-foreground">«{userToDelete?.name}»</strong>
              {copy.deleteModalDescSuffix}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={processingId === userToDelete?.id}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              {copy.cancelBtn}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={processingId === userToDelete?.id}
              className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
            >
              {processingId === userToDelete?.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>{copy.confirmDeleteBtn}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
