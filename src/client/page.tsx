import offersData from "../../raw_data/offers_1.json";
import { UpgradeCard } from "./components/UpgradeCard";
import type { CarOffer } from "./types/offers";

// --- Mock Data from API ---
const OFFERS: CarOffer[] = offersData.offers.slice(0, 20); // Use first 3 offers from the real data

export default function SixtPage() {
  return (
    <main className="min-h-screen bg-background font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex-1 space-y-6 px-5 py-6 pb-20">
          {/* Suggested Section */}
          <div className="space-y-4">
            <div className="space-y-8">
              {OFFERS.map((offer, index) => (
                <UpgradeCard key={offer.offer_id} offer={offer} variant={index % 2 === 0 ? "ai" : "normal"} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
