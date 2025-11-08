"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-[8rem] md:text-[10rem] font-extrabold gradient-title leading-none mb-6">
          404
        </h1>

        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-10">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        <Link href="/">
          <Button
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
          >
            Return Home
          </Button>
        </Link>

        <div className="mt-10 text-5xl animate-bounce">🚀</div>
      </motion.div>
    </div>
  );
}
