import type { CartItem, DeliveryMethodOption, Order, SiteContent } from '../types/store';
import { findPromo, promoDiscount } from '../utils/promo.js';

export class PricingError extends Error {}

// Recomputes an order's money fields from the published catalog so a shopper cannot
// change the amount they are charged by editing the request
export function priceOrder(
  content: SiteContent,
  rawItems: { productId: string; quantity: number }[],
  deliveryMethod: DeliveryMethodOption,
  promoCode: string
): Pick<Order, 'items' | 'totalRetail' | 'totalWholesale' | 'profit' | 'totalPv' | 'discount' | 'deliveryCost' | 'promoCode'> {
  const items: CartItem[] = rawItems.map(({ productId, quantity }) => {
    const product = content.products.find((p) => p.id === productId && !p.hidden);
    if (!product) throw new PricingError('unknown_product');
    return { product, quantity: Math.max(1, Math.min(999, Math.floor(quantity) || 1)) };
  });
  if (items.length === 0) throw new PricingError('empty_order');

  const subtotal = items.reduce((s, i) => s + i.product.retailPrice * i.quantity, 0);
  const totalWholesale = items.reduce((s, i) => s + i.product.wholesalePrice * i.quantity, 0);
  const totalPv = Number(items.reduce((s, i) => s + i.product.pv * i.quantity, 0).toFixed(1));

  const promo = findPromo(content.promoCodes, promoCode);
  const discount = promoDiscount(promo, subtotal);

  const st = content.settings;
  let deliveryCost = 0;
  if (deliveryMethod === 'courier_osh') {
    deliveryCost = subtotal >= (st.freeDeliveryThreshold ?? 3000) ? 0 : st.deliveryOshCost ?? 150;
  } else if (deliveryMethod === 'kg_delivery') {
    deliveryCost = subtotal >= (st.freeDeliveryKgThreshold ?? 5000) ? 0 : st.deliveryKgCost ?? 250;
  }

  const totalRetail = Math.max(0, subtotal - discount) + deliveryCost;
  return {
    items,
    totalRetail,
    totalWholesale,
    profit: subtotal - discount - totalWholesale,
    totalPv,
    discount,
    deliveryCost,
    promoCode: promo ? promo.code : undefined,
  };
}
