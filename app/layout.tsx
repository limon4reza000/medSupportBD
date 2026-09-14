import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedSupply — B2B Pharmaceutical Order Cutting & Distribution Platform",
  description:
    "Production-grade B2B pharma platform connecting depots, sales reps (MPO), and retail pharmacies with Near-Expiry FIFO batch allocation, trade schemes, credit safety, and AI prescription parsing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#01140f] text-white min-h-screen selection:bg-[#10b981] selection:text-black">
        {children}
      </body>
    </html>
  );
}
