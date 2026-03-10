import type { Metadata } from "next";
import { SpecBuilder } from '@/components/transformer/TransformerDesigner';

export const metadata: Metadata = {
  title: "AI Spec Builder | Build & Bid Your Transformer Specs | FluxCo",
  description:
    "Use FluxCo's AI Spec Builder to define your transformer requirements and send them to the market for competitive bids. Select voltage, kVA rating, cooling class, and more.",
  keywords: [
    "transformer spec builder",
    "transformer specification tool",
    "transformer RFP builder",
    "what size transformer do I need",
    "transformer kVA calculator",
    "transformer spec sheet",
  ],
  openGraph: {
    title: "AI Spec Builder | FluxCo",
    description:
      "Build your transformer specs and send them to the market for competitive bids with FluxCo's AI Spec Builder.",
    type: "website",
  },
};

export default function DesignPage() {
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 text-2xl" title="Made in USA">🇺🇸</div>
      <SpecBuilder />
    </>
  );
}
