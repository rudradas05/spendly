import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox, Target, Upload } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import ThemeToggle from "./theme-toggle";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="border-b border-slate-200/60 bg-white/90 backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/90">
        <nav className="container mx-auto flex items-center justify-between gap-4 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-emerald-600">
              Spendly
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <SignedIn>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-300"
              >
                <Link href="/dashboard" className="flex items-center gap-1.5">
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-300 hidden sm:flex"
              >
                <Link href="/goals" className="flex items-center gap-1.5">
                  <Target size={16} />
                  <span className="hidden md:inline">Goals</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-300 hidden sm:flex"
              >
                <Link href="/import" className="flex items-center gap-1.5">
                  <Upload size={16} />
                  <span className="hidden md:inline">Import</span>
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link
                  href="/transaction/create"
                  className="flex items-center gap-1.5"
                >
                  <PenBox size={16} />
                  <span className="hidden sm:inline">Add</span>
                </Link>
              </Button>
              <ThemeToggle />
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button size="sm" variant="ghost">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Get started</Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
