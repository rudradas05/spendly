import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="pt-28">
      <HeroSection />

      {/* Stats Section */}
      <section className="relative py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.12),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.12),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="grid gap-5 text-center sm:grid-cols-2 md:grid-cols-4">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="surface-panel group p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="text-3xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-600">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">Capabilities</p>
            <h2 className="section-title mt-3">
              Everything you need to manage your finances
            </h2>
            <p className="section-subtitle mt-4 leading-relaxed">
              Streamline spending, automate routine work, and surface insights
              that move your money forward.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature, index) => (
              <Card
                key={index}
                className="group border-white/70 bg-white/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="flex flex-col items-start space-y-4 p-6 text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/80 text-emerald-600 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-100 group-hover:shadow-md">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.04),transparent_40%)]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">Workflow</p>
            <h2 className="section-title mt-3">How it works</h2>
            <p className="section-subtitle mt-4 leading-relaxed">
              Set up in minutes and let the system handle the heavy lifting
              across your accounts.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {howItWorksData.map((step, index) => (
              <div
                key={index}
                className="surface-panel group relative p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-600 shadow-sm">
                  {index + 1}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/70 text-emerald-600 shadow-sm transition-all group-hover:scale-105 group-hover:bg-emerald-100">
                  {step.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">Stories</p>
            <h2 className="section-title mt-3">What our users say</h2>
            <p className="section-subtitle mt-4 leading-relaxed">
              Real people, real results. Here&apos;s how Spendly supports their
              financial decisions.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonialsData.map((testimonial, index) => (
              <Card
                key={index}
                className="group border-white/70 bg-white/80 p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="relative pt-4">
                  <Quote className="absolute -top-1 right-0 h-8 w-8 text-emerald-100 transition-colors group-hover:text-emerald-200" />
                  <div className="mb-4 flex items-center">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="ml-4">
                      <div className="font-semibold text-slate-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.4),transparent_55%)] opacity-70" />
        <div className="container relative mx-auto px-4 text-center text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            Get started today
          </span>
          <h2 className="mt-6 font-display text-3xl font-semibold sm:text-4xl md:text-5xl">
            Ready to take control of your finances?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            Join thousands of users who are already managing their finances
            smarter with Spendly.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group gap-2 bg-white px-8 text-slate-900 shadow-lg transition-all hover:scale-[1.02] hover:bg-emerald-50"
              >
                Start now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 px-8 text-white backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/20"
              >
                View features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
