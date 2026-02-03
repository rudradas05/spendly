import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox, Wallet, Menu } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 z-50 w-full animate-slide-down">
      <div className="h-px w-full bg-linear-to-r from-emerald-500/50 via-sky-500/40 to-amber-400/40" />
      <div className="border-b border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)]">
        <nav className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
            >
              <span className="gradient-title text-xl leading-none">
                Spendly
              </span>
              <span className="surface-chip hidden text-[0.6rem] uppercase tracking-[0.35em] text-slate-600 transition-colors group-hover:text-emerald-600 sm:inline-flex">
                smart finance
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-1 rounded-full border border-white/60 bg-white/70 px-1.5 py-1 text-sm text-slate-600 shadow-sm lg:flex">
            <SignedOut>
              <Link
                href="/#features"
                className="rounded-full px-4 py-1.5 font-medium transition-all hover:bg-emerald-50 hover:text-emerald-700"
              >
                Features
              </Link>
              <Link
                href="/#testimonials"
                className="rounded-full px-4 py-1.5 font-medium transition-all hover:bg-emerald-50 hover:text-emerald-700"
              >
                Stories
              </Link>
            </SignedOut>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-2 py-1.5 shadow-sm">
            <SignedIn>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full px-3 text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-700 md:px-4"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden rounded-full px-4 text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-700 sm:flex"
              >
                <Link
                  href="/dashboard#accounts"
                  className="flex items-center gap-2"
                >
                  <Wallet size={18} />
                  <span className="hidden md:inline">Accounts</span>
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="gradient rounded-full px-3 text-slate-900 shadow-[0_20px_35px_-25px_rgba(15,23,42,0.55)] transition-all hover:scale-[1.02] hover:shadow-[0_22px_40px_-25px_rgba(15,23,42,0.65)] md:px-4"
              >
                <Link
                  href="/transaction/create"
                  className="flex items-center gap-2"
                >
                  <PenBox size={18} />
                  <span className="hidden md:inline">Add Transaction</span>
                </Link>
              </Button>
            </SignedIn>

            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full px-4 text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Login
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedOut>
              <SignUpButton>
                <Button
                  size="sm"
                  className="rounded-full px-4 shadow-[0_18px_30px_-22px_rgba(15,23,42,0.55)] transition-all hover:scale-[1.02]"
                >
                  Start free
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-9 h-9 rounded-full ring-2 ring-white shadow-sm transition-transform hover:scale-105",
                  },
                }}
              />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
