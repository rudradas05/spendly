"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Send,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/70 bg-white/80 py-16 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_60%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.10),transparent_50%)]" />
      <div className="container relative mx-auto px-6">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:text-left">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h2 className="gradient-title text-2xl transition-transform hover:scale-[1.02]">
                Spendly
              </h2>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600">
              Track your spending, set budgets, and keep every account aligned
              with your financial goals.
            </p>
            <p className="text-xs text-slate-500">
              Making personal finance simple since 2024
            </p>
          </div>

          {/* Newsletter Section */}
          <div className="surface-panel p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Stay updated
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Get product tips and spending insights in your inbox.
            </p>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-4 flex items-center justify-center md:justify-start"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                className="w-2/3 rounded-r-none border-r-0 focus:z-10"
                aria-label="Email address"
              />
              <Button type="submit" className="rounded-l-none shadow-sm">
                <Send className="mr-2 h-4 w-4" /> Subscribe
              </Button>
            </form>
            <p className="mt-3 text-xs text-slate-500">
              No spam. Unsubscribe anytime.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Quick links
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/#features", label: "Features" },
                { href: "/#testimonials", label: "Stories" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-slate-600 transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="my-10 border-t border-slate-200/60" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-6 text-sm text-slate-500 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <p>
              © {currentYear}{" "}
              <span className="font-semibold text-slate-700">Spendly</span>. All
              rights reserved.
            </p>
            <span className="hidden md:inline text-slate-300">•</span>
            <div className="flex gap-4 text-xs">
              <Link
                href="#"
                className="transition-colors hover:text-emerald-600"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-emerald-600"
              >
                Terms
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[
              {
                href: "https://instagram.com",
                icon: Instagram,
                label: "Instagram",
              },
              {
                href: "https://facebook.com",
                icon: Facebook,
                label: "Facebook",
              },
              {
                href: "https://linkedin.com",
                icon: Linkedin,
                label: "LinkedIn",
              },
              { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
            ].map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md"
              >
                <social.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
