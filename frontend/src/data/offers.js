/**
 * Indian-store style demo offers.
 * Applying an offer changes the payable cart total — it is not a dummy label.
 */

export const RESCUE_OFFERS = [
  {
    id: "rescue10",
    title: "Wait! 10% off your order",
    detail: "Complete your purchase now and save 10%.",
    badge: "Rescue",
    type: "percent",
    value: 10,
    headline: "Wait! Get 10% off your order — Complete your purchase now.",
  },
  {
    id: "freedelivery",
    title: "Free delivery",
    detail: "Free delivery is available on this order if you complete checkout now.",
    badge: "Delivery",
    type: "flat",
    value: 149,
    headline: "Free delivery available for your order!",
  },
];

export const OFFER_POOL = [
  {
    id: "festive10",
    title: "Festive Sale",
    detail: "10% off this order",
    badge: "Today",
    type: "percent",
    value: 10,
  },
  {
    id: "bank12",
    title: "HDFC Bank Offer",
    detail: "12% instant discount, max ₹1,500",
    badge: "Bank",
    type: "percent_cap",
    value: 12,
    cap: 1500,
  },
  {
    id: "upi200",
    title: "UPI Cashback",
    detail: "Flat ₹200 off on prepaid checkout",
    badge: "UPI",
    type: "flat",
    value: 200,
  },
  {
    id: "new500",
    title: "Welcome Deal",
    detail: "Flat ₹500 off on orders above ₹5,000",
    badge: "New",
    type: "flat_min",
    value: 500,
    min: 5000,
  },
  {
    id: "extra5",
    title: "Cart Extra",
    detail: "Extra 5% off, no coupon code needed",
    badge: "Auto",
    type: "percent",
    value: 5,
  },
  {
    id: "student8",
    title: "Student Discount",
    detail: "8% off for campus shoppers",
    badge: "Campus",
    type: "percent",
    value: 8,
  },
  {
    id: "ship99",
    title: "Shipping Saver",
    detail: "₹99 shipping credit on this order",
    badge: "Delivery",
    type: "flat",
    value: 99,
  },
  {
    id: "combo15",
    title: "Bundle Bonus",
    detail: "15% off when the cart has 2 or more items",
    badge: "Combo",
    type: "percent_qty",
    value: 15,
    minQty: 2,
  },
  {
    id: "sbi750",
    title: "SBI Card Night",
    detail: "Flat ₹750 off on orders above ₹15,000",
    badge: "SBI",
    type: "flat_min",
    value: 750,
    min: 15000,
  },
  {
    id: "app299",
    title: "Flash Drop",
    detail: "Flat ₹299 off this cart",
    badge: "Flash",
    type: "flat",
    value: 299,
  },
  {
    id: "axis10",
    title: "Axis Bank EMI",
    detail: "10% off, capped at ₹2,000",
    badge: "EMI",
    type: "percent_cap",
    value: 10,
    cap: 2000,
  },
  {
    id: "republic7",
    title: "Republic Days",
    detail: "7% festive discount on electronics",
    badge: "Sale",
    type: "percent",
    value: 7,
  },
];

export function computeDiscount(subtotal, itemCount, offer) {
  if (!offer || subtotal <= 0) return 0;

  if (offer.type === "percent") {
    return Math.round((subtotal * offer.value) / 100);
  }
  if (offer.type === "percent_cap") {
    return Math.min(offer.cap, Math.round((subtotal * offer.value) / 100));
  }
  if (offer.type === "flat") {
    return Math.min(subtotal, offer.value);
  }
  if (offer.type === "flat_min") {
    return subtotal >= offer.min ? Math.min(subtotal, offer.value) : 0;
  }
  if (offer.type === "percent_qty") {
    if (itemCount < offer.minQty) return 0;
    return Math.round((subtotal * offer.value) / 100);
  }
  return 0;
}

export function offerMeetsRules(subtotal, itemCount, offer) {
  if (offer.type === "flat_min") return subtotal >= offer.min;
  if (offer.type === "percent_qty") return itemCount >= offer.minQty;
  return true;
}

/** Pick three distinct offers so each add-to-cart popup looks different. */
export function pickOffers(product, subtotal, itemCount) {
  const seed = `${product?.id || "cart"}-${Date.now()}`;
  const shuffled = [...OFFER_POOL].sort((a, b) => hash(`${seed}-${a.id}`) - hash(`${seed}-${b.id}`));
  const unlocked = shuffled.filter((offer) => offerMeetsRules(subtotal, itemCount, offer));
  const locked = shuffled.filter((offer) => !offerMeetsRules(subtotal, itemCount, offer));
  return [...unlocked, ...locked].slice(0, 3);
}

function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) % 100000;
  return value;
}
