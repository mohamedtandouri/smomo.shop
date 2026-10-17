import { create } from "zustand"
import { persist } from "zustand/middleware"

export type LanguageCode = "ar" | "en" | "fr"
export type Direction = "rtl" | "ltr"

export interface LanguageOption {
  code: LanguageCode
  name: string
  nativeName: string
  direction: Direction
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    flag: "🇸🇦",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English (US)",
    direction: "ltr",
    flag: "🇺🇸",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
    flag: "🇫🇷",
  },
]

export const translations: Record<LanguageCode, Record<string, string>> = {
  ar: {
    // Nav & General
    "nav.dashboard": "لوحة التحكم",
    "nav.orders": "الطلبات",
    "nav.all_orders": "جميع الطلبات",
    "nav.new_order": "طلب جديد",
    "nav.abandoned_carts": "العربات المهجورة",
    "nav.products": "المنتجات",
    "nav.all_products": "جميع المنتجات",
    "nav.new_product": "منتج جديد",
    "nav.categories": "التصنيفات",
    "nav.reviews": "التقييمات",
    "nav.inventory": "المخزون",
    "nav.marketing": "التسويق",
    "nav.overview": "نظرة عامة",
    "nav.coupons": "الكوبونات",
    "nav.upsells": "عروض إضافية",
    "nav.store": "المتجر",
    "nav.theme": "تخصيص القالب",
    "nav.themes": "مكتبة القوالب",
    "nav.menus": "القوائم",
    "nav.languages": "اللغات والترجمة",
    "nav.pages": "الصفحات",
    "nav.funnels": "مسارات البيع",
    "nav.customers": "العملاء",
    "nav.analytics": "التحليلات",
    "nav.insights": "الرؤى والتقارير",
    "nav.invoices": "الفواتير",
    "nav.apps": "التطبيقات",
    "nav.settings": "الإعدادات",
    "nav.view_store": "عرض المتجر",

    // Common Actions & Labels
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.search": "بحث...",
    "common.filter": "تصفية",
    "common.status": "الحالة",
    "common.actions": "الإجراءات",
    "common.view": "عرض",
    "common.loading": "جاري التحميل...",
    "common.success": "تمت العملية بنجاح",
    "common.error": "حدث خطأ ما",
    "common.dismiss": "إغلاق",
    "common.back": "رجوع",
    "common.notifications": "الإشعارات",
    "common.profile": "الملف الشخصي",
    "common.logout": "تسجيل الخروج",
    "common.active": "نشط",
    "common.export": "تصدير",
    "common.import": "استيراد",

    // Inventory
    "inventory.management": "إدارة المخزون",
    "inventory.subtitle": "راقب مستويات المخزون ومراجعات الجرد بدقة.",
    "inventory.total_units": "إجمالي الوحدات",
    "inventory.low_stock": "أصناف منخفضة",
    "inventory.out_of_stock": "نافدة من المخزون",
    "inventory.in_stock": "متوفر في المخزون",
    "inventory.current_stock": "المخزون الحالي",
    "inventory.update_stock": "تحديث المخزون",
    "inventory.view_reviews": "مراجعات الجرد",
    "inventory.new_review": "مراجعة جديدة",
    "inventory.expected": "المتوقع",
    "inventory.actual": "الفعلي",
    "inventory.discrepancy": "فارق / تباين",
    "inventory.matched": "متطابق",

    // Storefront
    "store.home": "الرئيسية",
    "store.products": "المنتجات",
    "store.categories": "التصنيفات",
    "store.cart": "السلة",
    "store.checkout": "إتمام الطلب",
    "store.add_to_cart": "أضف إلى السلة",
    "store.buy_now": "شراء الآن",
    "store.quantity": "الكمية",
    "store.price": "السعر",
    "store.reviews": "المراجعات والتقييمات",
    "store.description": "وصف المنتج",
    "store.free_shipping": "شحن مجاني لجميع الطلبات",
    "store.language": "اللغة",
    "store.currency": "العملة",
  },

  en: {
    // Nav & General
    "nav.dashboard": "Dashboard",
    "nav.orders": "Orders",
    "nav.all_orders": "All Orders",
    "nav.new_order": "New Order",
    "nav.abandoned_carts": "Abandoned Carts",
    "nav.products": "Products",
    "nav.all_products": "All Products",
    "nav.new_product": "New Product",
    "nav.categories": "Categories",
    "nav.reviews": "Reviews",
    "nav.inventory": "Inventory",
    "nav.marketing": "Marketing",
    "nav.overview": "Overview",
    "nav.coupons": "Coupons",
    "nav.upsells": "Up Sells",
    "nav.store": "Store",
    "nav.theme": "Theme",
    "nav.themes": "Themes",
    "nav.menus": "Menus",
    "nav.languages": "Languages",
    "nav.pages": "Pages",
    "nav.funnels": "Funnels",
    "nav.customers": "Customers",
    "nav.analytics": "Analytics",
    "nav.insights": "Insights",
    "nav.invoices": "Invoices",
    "nav.apps": "Apps",
    "nav.settings": "Settings",
    "nav.view_store": "View Store",

    // Common Actions & Labels
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.search": "Search...",
    "common.filter": "Filter",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.view": "View",
    "common.loading": "Loading...",
    "common.success": "Success",
    "common.error": "An error occurred",
    "common.dismiss": "Dismiss",
    "common.back": "Back",
    "common.notifications": "Notifications",
    "common.profile": "Profile",
    "common.logout": "Sign Out",
    "common.active": "Active",
    "common.export": "Export",
    "common.import": "Import",

    // Inventory
    "inventory.management": "Inventory Management",
    "inventory.subtitle": "Monitor your stock levels and inventory reviews.",
    "inventory.total_units": "Total Units",
    "inventory.low_stock": "Low Stock Items",
    "inventory.out_of_stock": "Out of Stock",
    "inventory.in_stock": "In Stock",
    "inventory.current_stock": "Current Stock",
    "inventory.update_stock": "Update Stock",
    "inventory.view_reviews": "View Reviews",
    "inventory.new_review": "New Review",
    "inventory.expected": "Expected",
    "inventory.actual": "Actual",
    "inventory.discrepancy": "Discrepancy",
    "inventory.matched": "Matched",

    // Storefront
    "store.home": "Home",
    "store.products": "Products",
    "store.categories": "Categories",
    "store.cart": "Cart",
    "store.checkout": "Checkout",
    "store.add_to_cart": "Add to Cart",
    "store.buy_now": "Buy Now",
    "store.quantity": "Quantity",
    "store.price": "Price",
    "store.reviews": "Customer Reviews",
    "store.description": "Product Description",
    "store.free_shipping": "Free shipping on all orders",
    "store.language": "Language",
    "store.currency": "Currency",
  },

  fr: {
    // Nav & General
    "nav.dashboard": "Tableau de bord",
    "nav.orders": "Commandes",
    "nav.all_orders": "Toutes les commandes",
    "nav.new_order": "Nouvelle commande",
    "nav.abandoned_carts": "Paniers abandonnés",
    "nav.products": "Produits",
    "nav.all_products": "Tous les produits",
    "nav.new_product": "Nouveau produit",
    "nav.categories": "Catégories",
    "nav.reviews": "Avis",
    "nav.inventory": "Inventaire",
    "nav.marketing": "Marketing",
    "nav.overview": "Aperçu",
    "nav.coupons": "Coupons",
    "nav.upsells": "Ventes incitatives",
    "nav.store": "Boutique",
    "nav.theme": "Thème",
    "nav.themes": "Thèmes",
    "nav.menus": "Menus",
    "nav.languages": "Langues",
    "nav.pages": "Pages",
    "nav.funnels": "Entonnoirs de vente",
    "nav.customers": "Clients",
    "nav.analytics": "Analytique",
    "nav.insights": "Rapports",
    "nav.invoices": "Factures",
    "nav.apps": "Applications",
    "nav.settings": "Paramètres",
    "nav.view_store": "Voir la boutique",

    // Common Actions & Labels
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.edit": "Modifier",
    "common.search": "Rechercher...",
    "common.filter": "Filtrer",
    "common.status": "Statut",
    "common.actions": "Actions",
    "common.view": "Afficher",
    "common.loading": "Chargement...",
    "common.success": "Opération réussie",
    "common.error": "Une erreur est survenue",
    "common.dismiss": "Fermer",
    "common.back": "Retour",
    "common.notifications": "Notifications",
    "common.profile": "Profil",
    "common.logout": "Déconnexion",
    "common.active": "Actif",
    "common.export": "Exporter",
    "common.import": "Importer",

    // Inventory
    "inventory.management": "Gestion des stocks",
    "inventory.subtitle": "Surveillez vos niveaux de stock et vos vérifications.",
    "inventory.total_units": "Unités totales",
    "inventory.low_stock": "Stock faible",
    "inventory.out_of_stock": "Rupture de stock",
    "inventory.in_stock": "En stock",
    "inventory.current_stock": "Stock actuel",
    "inventory.update_stock": "Mettre à jour le stock",
    "inventory.view_reviews": "Voir les vérifications",
    "inventory.new_review": "Nouvelle vérification",
    "inventory.expected": "Attendu",
    "inventory.actual": "Réel",
    "inventory.discrepancy": "Écart",
    "inventory.matched": "Correspondant",

    // Storefront
    "store.home": "Accueil",
    "store.products": "Produits",
    "store.categories": "Catégories",
    "store.cart": "Panier",
    "store.checkout": "Paiement",
    "store.add_to_cart": "Ajouter au panier",
    "store.buy_now": "Acheter maintenant",
    "store.quantity": "Quantité",
    "store.price": "Prix",
    "store.reviews": "Avis clients",
    "store.description": "Description du produit",
    "store.free_shipping": "Livraison gratuite sur toutes les commandes",
    "store.language": "Langue",
    "store.currency": "Devise",
  },
}

interface LocaleState {
  language: LanguageCode
  direction: Direction
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  setLanguage: (lang: LanguageCode) => void
  t: (key: string, fallback?: string) => string
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      language: "ar",
      direction: "rtl",
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      setLanguage: (lang: LanguageCode) => {
        const option = SUPPORTED_LANGUAGES.find((l) => l.code === lang)
        const direction: Direction = option ? option.direction : "rtl"

        if (typeof document !== "undefined") {
          document.documentElement.lang = lang
          document.documentElement.dir = direction
          document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`
        }

        set({ language: lang, direction })
      },
      t: (key: string, fallback?: string) => {
        const currentLang = get().language || "ar"
        const dictionary = translations[currentLang] || translations.ar || translations.en
        return dictionary[key] || translations.ar?.[key] || translations.en?.[key] || fallback || key
      },
    }),
    {
      name: "smomo-locale-storage",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
