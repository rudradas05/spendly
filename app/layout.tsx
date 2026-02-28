import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import Header from "@/components/header";
import { Toaster } from "sonner";
import Footer from "@/components/footer";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  title: "Spendly - Track Your Expenses",
  description: "Track your expenses, set budgets, and manage your money easily with Spendly.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${manrope.variable} ${fraunces.variable}`} suppressHydrationWarning>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <Header />
            <main className="flex-1">{children}</main>
            <Toaster richColors position="top-right" />
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}