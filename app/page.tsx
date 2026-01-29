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

export default function Home() {
  return (
    <div className="pt-28">
      <HeroSection />

      <section className="relative py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.12),_transparent_45%),radial-gradient(circle_at_80%_60%,_rgba(59,130,246,0.12),_transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="grid gap-6 text-center sm:grid-cols-2 md:grid-cols-4">
            {statsData.map((stat, index) => (
              <div key={index} className="surface-panel p-6">
                <div className="text-3xl font-semibold text-slate-900">
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

      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">Capabilities</p>
            <h2 className="section-title mt-3">
              Everything you need to manage your finances
            </h2>
            <p className="section-subtitle mt-4">
              Streamline spending, automate routine work, and surface insights
              that move your money forward.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature, index) => (
              <Card
                key={index}
                className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="flex flex-col items-start space-y-4 p-6 text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/80 text-emerald-600 shadow-sm transition group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.04),_transparent_40%)]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">Workflow</p>
            <h2 className="section-title mt-3">How it works</h2>
            <p className="section-subtitle mt-4">
              Set up in minutes and let the system handle the heavy lifting
              across your accounts.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {howItWorksData.map((step, index) => (
              <div key={index} className="surface-panel p-6 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/70 text-emerald-600 shadow-sm">
                  {step.icon}
                </div>
                <div className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                  Step {index + 1}
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-kicker">Stories</p>
            <h2 className="section-title mt-3">What our users say</h2>
            <p className="section-subtitle mt-4">
              Real people, real results. Here is how Spendly supports their
              decisions.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-center">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full border border-white/60"
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
                  <p className="text-sm text-slate-600">{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="container relative mx-auto px-4 text-center text-white">
          <span className="surface-chip border-white/20 bg-white/10 text-white">
            Get started today
          </span>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Ready to take control of your finances?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-emerald-100/90">
            Join thousands of users who are already managing their finances
            smarter with Spendly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-emerald-50"
              >
                Start now
              </Button>
            </Link>
            <Link href="/#features">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15"
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
