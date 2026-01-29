"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <section className="relative overflow-hidden px-4 pb-24 pt-14 md:pb-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),radial-gradient(circle_at_90%_20%,_rgba(56,189,248,0.18),_transparent_55%)]" />
      <div className="container relative mx-auto grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <span className="surface-chip">AI money OS</span>
          <h1 className="gradient-title text-5xl leading-tight md:text-7xl">
            Manage your finances with calm, confident clarity.
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            Spendly is the AI-powered command center that keeps your accounts,
            budgets, and insights in sync so you always know your next move.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="px-8">
                Get started
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                Explore features
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            {[
              { label: "Automation rate", value: "92%" },
              { label: "Avg. savings", value: "+18%" },
              { label: "Time saved", value: "6.4h/mo" },
            ].map((stat) => (
              <div key={stat.label} className="surface-panel p-4 text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="hero-image-wrapper">
            <div ref={imageRef} className="hero-image">
              <Image
                src="/banner.jpeg"
                width={1280}
                height={720}
                alt="Dashboard preview"
                className="mx-auto rounded-3xl border border-white/70 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.6)]"
                priority
              />
            </div>
          </div>

          <div className="pointer-events-none absolute -left-6 bottom-10 hidden w-48 rounded-2xl border border-white/60 bg-white/80 p-4 text-left shadow-lg backdrop-blur lg:block">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Monthly net
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">+$3,482</p>
            <p className="text-xs text-slate-500">Up 12% vs last month</p>
          </div>

          <div className="pointer-events-none absolute -right-6 top-10 hidden w-52 rounded-2xl border border-white/60 bg-white/85 p-4 text-left shadow-lg backdrop-blur lg:block">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Cash runway
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">7.4 mo</p>
            <p className="text-xs text-slate-500">Based on current burn</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
