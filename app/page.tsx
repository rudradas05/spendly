import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, testimonialsData } from "@/data/landing";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

export default function Home() {
  return (
    <div className="pt-28">
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">
              Built for simplicity
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              The features you need, nothing you don't.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature, index) => (
              <Card
                key={index}
                className="group border-white/70 bg-white/80 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/80"
              >
                <CardContent className="flex flex-col items-start space-y-3 p-5 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">
              What people say
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {testimonialsData.map((testimonial, index) => (
              <Card
                key={index}
                className="group border-white/70 bg-white/80 p-5 transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/80"
              >
                <CardContent className="relative pt-2">
                  <Quote className="absolute -top-1 right-0 h-6 w-6 text-emerald-100 dark:text-emerald-900" />
                  <div className="mb-3 flex items-center">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="surface-panel mx-auto max-w-2xl p-8 text-center md:p-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">
              Ready to track smarter?
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Start managing your finances in under a minute.
            </p>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button className="gap-2 px-8">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
