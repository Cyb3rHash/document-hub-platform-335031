import React from "react";
import { MarketingFooter, MarketingHero, MarketingNav } from "@/components/marketing";
import { FeaturesSection, PricingSection, SecuritySection } from "@/components/landingSections";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <MarketingNav />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <MarketingHero />
        <FeaturesSection />
        <SecuritySection />
        <PricingSection />
        <MarketingFooter />
      </div>
    </main>
  );
}
