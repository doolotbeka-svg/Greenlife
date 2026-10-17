import { PromoCode } from '../types/store';

export function findPromo(codes: PromoCode[], code: string): PromoCode | null {
  const wanted = code.trim().toUpperCase();
  if (!wanted) return null;
  const today = new Date().toISOString().slice(0, 10);
  return (
    codes.find(
      (p) => p.active && p.code.trim().toUpperCase() === wanted && (!p.expiresAt || p.expiresAt >= today)
    ) || null
  );
}

// Discount in som for a subtotal; 0 when the order is below the promo's minimum
export function promoDiscount(promo: PromoCode | null, subtotal: number): number {
  if (!promo || subtotal < (promo.minOrder || 0)) return 0;
  const raw = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return Math.max(0, Math.min(subtotal, raw));
}
