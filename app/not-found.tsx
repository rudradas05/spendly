"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="surface-panel px-10 py-12"
      >
        <p className="section-kicker">Error 404</p>
        <h1 className="font-display text-5xl font-semibold text-slate-900 md:text-6xl">
          This page drifted away.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-slate-600">
          The link you followed doesn't exist or was moved. Let's get you back
          on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

