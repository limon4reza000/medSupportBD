import type { Metadata } from "next";
import "./globals.css";
import { RootLayoutWrapper } from "@/components/layout/RootLayoutWrapper";

export const metadata: Metadata = {
  title: "MedSupply — B2B Pharmaceutical Order Cutting & Distribution Platform",
  description:
    "Production-grade B2B pharma platform connecting depots, sales reps (MPO), and retail pharmacies with Near-Expiry FEFO batch allocation, trade schemes, credit safety, and AI prescription parsing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#025540] text-white min-h-screen selection:bg-[#34d399] selection:text-black">
        <RootLayoutWrapper>{children}</RootLayoutWrapper>
      </body>
    </html>
  );
}
