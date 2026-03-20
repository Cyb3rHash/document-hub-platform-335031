import React from "react";
import { MarketingFooter, MarketingHero, MarketingNav } from "@/components/marketing";
import { FeaturesSection, PricingSection, SecuritySection } from "@/components/landingSections";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <MarketingNav />
      <MarketingHero />
      <FeaturesSection />
      <SecuritySection />
      <PricingSection />
      <MarketingFooter />
    </main>
  );
}
