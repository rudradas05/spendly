"use client";

import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/60 py-8 dark:border-slate-700/60">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400 md:flex-row">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="font-semibold text-slate-700 dark:text-slate-200"
            >
              Spendly
            </Link>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>© {currentYear}</span>
          </div>
          <div className="flex gap-4 text-xs">
            <Link href="#" className="transition-colors hover:text-emerald-600">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-emerald-600">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
