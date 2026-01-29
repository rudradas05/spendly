import React from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(251,191,36,0.2),_transparent_50%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center">
          <div className="flex-1 text-white">
            <Link href="/" className="gradient-title inline-flex items-center gap-2 text-lg">
              Spendly
            </Link>
            <h1 className="mt-8 text-4xl font-semibold leading-tight sm:text-5xl">
              Your financial command center.
            </h1>
            <p className="mt-4 max-w-md text-sm text-slate-200">
              Track spending, manage budgets, and unlock insights with a calm,
              elegant workflow built for everyday money decisions.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                  Real-time
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Smart alerts
                </p>
                <p className="text-xs text-slate-300">
                  Stay ahead of overspend.
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                  Focused
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Unified budgets
                </p>
                <p className="text-xs text-slate-300">
                  All accounts, one view.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
