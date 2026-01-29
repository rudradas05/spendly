"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/70 bg-white/70 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_60%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.12),_transparent_50%)]" />
      <div className="container relative mx-auto px-6">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:text-left">
          <div>
            <h2 className="gradient-title text-2xl">Spendly</h2>
            <p className="mt-4 text-sm text-slate-600">
              Track your spending, set budgets, and keep every account aligned
              with your goals.
            </p>
          </div>

          <div className="surface-panel p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Subscribe to updates
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Get product tips and spending insights in your inbox.
            </p>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-4 flex items-center justify-center md:justify-start"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-2/3 rounded-r-none"
              />
              <Button type="submit" className="rounded-l-none">
                <Send className="mr-2 h-4 w-4" /> Subscribe
              </Button>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Quick links</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="transition hover:text-emerald-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#features" className="transition hover:text-emerald-600">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="transition hover:text-emerald-600">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-emerald-600">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 border-t border-white/60" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold">Spendly</span>.
            All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="https://instagram.com"
              target="_blank"
              className="surface-chip transition hover:text-emerald-600"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              className="surface-chip transition hover:text-emerald-600"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              className="surface-chip transition hover:text-emerald-600"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              className="surface-chip transition hover:text-emerald-600"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
