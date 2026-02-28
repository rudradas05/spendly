"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Receipt, Target, Upload } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_55%)]" />
      <div className="container relative mx-auto max-w-4xl text-center">
        <h1 className="gradient-title animate-slide-up text-4xl leading-tight md:text-6xl">
          Track money. Simply.
        </h1>
        <p className="mx-auto mt-5 max-w-xl animate-slide-up text-base leading-relaxed text-slate-600 dark:text-slate-400 stagger-1 md:text-lg">
          A clean expense tracker with AI receipt scanning, CSV imports, and
          spending goals. No complexity, just clarity.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-slide-up stagger-2">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="group gap-2 px-8 shadow-lg transition-all hover:scale-[1.02]"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-in stagger-3">
          <span className="surface-chip flex items-center gap-2 px-4 py-2">
            <Receipt className="h-4 w-4 text-emerald-500" />
            AI Receipt Scanner
          </span>
          <span className="surface-chip flex items-center gap-2 px-4 py-2">
            <Upload className="h-4 w-4 text-blue-500" />
            CSV Import
          </span>
          <span className="surface-chip flex items-center gap-2 px-4 py-2">
            <Target className="h-4 w-4 text-purple-500" />
            Spending Goals
          </span>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mt-12 animate-fade-in stagger-4">
          <div className="hero-image-wrapper">
            <div ref={imageRef} className="hero-image">
              <Image
                src="/banner.jpeg"
                width={1280}
                height={720}
                alt="Dashboard preview"
                className="mx-auto rounded-2xl border border-white/60 shadow-2xl dark:border-slate-700"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
