"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="surface-panel max-w-lg px-10 py-12"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50/80">
          <span className="gradient-title text-4xl">404</span>
        </div>
        <p className="section-kicker">Page not found</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 dark:text-slate-100 md:text-5xl">
          This page drifted away
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          The link you followed doesn&apos;t exist or was moved. Let&apos;s get
          you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="gap-2 shadow-lg transition-all hover:scale-[1.02]"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Return home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 transition-all hover:scale-[1.02]"
          >
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
