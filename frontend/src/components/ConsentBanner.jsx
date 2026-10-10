import { useTracking } from "../context/TrackingContext.jsx";

export default function ConsentBanner() {
  const { consent, grantConsent, denyConsent } = useTracking();
  if (consent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-moss">Privacy notice</p>
        <h2 className="mt-2 font-display text-2xl">Academic demo tracking</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          This academic demo collects anonymous interaction signals such as mouse movement,
          scrolling, clicks, and page timing to demonstrate cart-abandonment prediction. No
          passwords, payment information, or sensitive personal information are collected.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={grantConsent}
            className="rounded-full bg-moss px-5 py-3 text-sm text-white"
          >
            Allow Demo Tracking
          </button>
          <button
            type="button"
            onClick={denyConsent}
            className="rounded-full border border-ink/15 px-5 py-3 text-sm"
          >
            Continue Without Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
