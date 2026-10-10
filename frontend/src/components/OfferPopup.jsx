import { useNavigate } from "react-router-dom";
import { computeDiscount, offerMeetsRules } from "../data/offers.js";
import { useCart } from "../context/CartContext.jsx";
import { formatMoney } from "../utils/features.js";

export default function OfferPopup() {
  const { offerModal, closeOffers, applyOffer, subtotal, count, items } = useCart();
  const navigate = useNavigate();

  if (!offerModal) return null;

  const { product, offers } = offerModal;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.18em] text-moss">Added to cart</p>
        <h2 id="offer-title" className="mt-2 font-display text-3xl">
          {product.name}
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          {formatMoney(product.price)} · Cart total {formatMoney(subtotal)}
        </p>
        <p className="mt-4 text-sm text-ink/70">
          Choose one offer to continue. Each add-to-cart shows a different set of deals, and the
          selected offer updates the amount you pay.
        </p>

        <div className="mt-5 grid gap-3">
          {offers.map((offer) => {
            const unlocked = offerMeetsRules(subtotal, count, offer);
            const saving = computeDiscount(subtotal, count, offer);
            return (
              <button
                key={offer.id}
                type="button"
                disabled={!unlocked}
                onClick={() => applyOffer(offer)}
                className="rounded-2xl border border-ink/10 p-4 text-left transition hover:border-moss disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-moss">{offer.badge}</p>
                    <p className="mt-1 font-semibold">{offer.title}</p>
                    <p className="mt-1 text-sm text-ink/60">{offer.detail}</p>
                    {!unlocked && (
                      <p className="mt-2 text-xs text-amber-700">Add more items to unlock this deal.</p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-moss">
                    {unlocked ? `Save ${formatMoney(saving)}` : "Locked"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              closeOffers();
              navigate(items.length ? "/checkout" : "/products");
            }}
            className="flex-1 rounded-full bg-moss px-5 py-3 text-sm text-white"
          >
            Go to Checkout
          </button>
          <button
            type="button"
            onClick={closeOffers}
            className="flex-1 rounded-full border border-ink/15 px-5 py-3 text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
