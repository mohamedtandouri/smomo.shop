/** حد المخزون المنخفض المعتمد في لوحة التحكم */
export const LOW_STOCK_THRESHOLD = 20

/**
 * يحدد حالة المخزون لمنتج بناءً على الكمية المتوفرة.
 * (نُقلت من `app/api/inventory/route.ts` لأن ملفات المسارات يجب ألا تُصدّر سوى معالجات HTTP).
 *
 * @param stock - الكمية الحالية
 * @returns "out_of_stock" | "low_stock" | "in_stock"
 */
export function getStockStatus(stock: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock <= 0) return "out_of_stock"
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock"
  return "in_stock"
}
