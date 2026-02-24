import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TopBanner from "@/components/TopBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/components/LocaleProvider";
import { CampaignTranslationsProvider } from "@/contexts/CampaignTranslationsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Amane+ - Finance Islamique Éthique",
  description: "Votre plateforme de confiance pour les dons, la zakat, les investissements halal et la protection takaful. Ensemble, construisons un avenir meilleur.",
  keywords: "finance islamique, zakat, dons, takaful, investissements halal, épargne",
  authors: [{ name: "Amane+" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <AuthProvider>
          <LocaleProvider>
            <CampaignTranslationsProvider>
              <div className="min-h-screen flex flex-col">
                <TopBanner />
                <Navigation />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </CampaignTranslationsProvider>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
