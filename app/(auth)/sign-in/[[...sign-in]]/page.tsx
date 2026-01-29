"use client";

import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <SignIn
      appearance={{
        variables: {
          colorPrimary: "#10b981",
        },
        elements: {
          card:
            "bg-white/80 rounded-3xl shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] border border-white/60 backdrop-blur w-full",
          headerTitle: "text-2xl font-semibold text-slate-900",
          headerSubtitle: "text-sm text-slate-500",
          socialButtonsBlockButton:
            "border border-border/70 bg-white/70 hover:bg-white text-slate-700 rounded-xl",
          formButtonPrimary:
            "bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-[0_20px_35px_-25px_rgba(15,23,42,0.6)]",
          footerActionLink: "text-emerald-600 hover:text-emerald-500",
          formFieldInput:
            "rounded-xl border-border/70 bg-white/70 focus:border-emerald-400 focus:ring-emerald-400",
        },
      }}
    />
  );
};

export default SignInPage;
