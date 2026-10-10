import { createContext, useContext, useMemo, useState } from "react";
import { computeDiscount, pickOffers } from "../data/offers.js";

const STORAGE_KEY = "cartt_cart_inr";
const OFFER_KEY = "cartt_applied_offer";
const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadOffer() {
  try {
    const raw = sessionStorage.getItem(OFFER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [appliedOffer, setAppliedOffer] = useState(loadOffer);
  const [offerModal, setOfferModal] = useState(null);

  function persist(next) {
    setItems(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function persistOffer(offer) {
    setAppliedOffer(offer);
    if (offer) sessionStorage.setItem(OFFER_KEY, JSON.stringify(offer));
    else sessionStorage.removeItem(OFFER_KEY);
  }

  function addItem(product, quantity = 1) {
    const next = [...items];
    const existing = next.find((row) => row.id === product.id);
    if (existing) existing.quantity += quantity;
    else next.push({ ...product, quantity });
    persist(next);

    const count = next.reduce((sum, row) => sum + row.quantity, 0);
    const subtotal = next.reduce((sum, row) => sum + row.price * row.quantity, 0);
    setOfferModal({
      product,
      offers: pickOffers(product, subtotal, count),
    });
  }

  function removeItem(id) {
    persist(items.filter((row) => row.id !== id));
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) return removeItem(id);
    persist(items.map((row) => (row.id === id ? { ...row, quantity } : row)));
  }

  function clearCart() {
    persist([]);
    persistOffer(null);
    setOfferModal(null);
  }

  function applyOffer(offer) {
    persistOffer(offer);
    setOfferModal(null);
  }

  function closeOffers() {
    setOfferModal(null);
  }

  const count = items.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = items.reduce((sum, row) => sum + row.price * row.quantity, 0);
  const discount = computeDiscount(subtotal, count, appliedOffer);
  const total = Math.max(0, subtotal - discount);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      count,
      subtotal,
      discount,
      total,
      appliedOffer,
      applyOffer,
      offerModal,
      closeOffers,
    }),
    [items, count, subtotal, discount, total, appliedOffer, offerModal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
