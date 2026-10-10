import { Outlet } from "react-router-dom";
import ConsentBanner from "./ConsentBanner.jsx";
import Footer from "./Footer.jsx";
import InterventionPopup from "./InterventionPopup.jsx";
import Navbar from "./Navbar.jsx";
import OfferPopup from "./OfferPopup.jsx";
import RiskIndicator from "./RiskIndicator.jsx";

export default function ShopLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
      <Footer />
      <ConsentBanner />
      <OfferPopup />
      <RiskIndicator />
      <InterventionPopup />
    </div>
  );
}
