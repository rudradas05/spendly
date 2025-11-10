"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-blue-50 dark:bg-neutral-900 border-t border-blue-100 dark:border-neutral-800 py-12 mt-10">
      <div className="container mx-auto px-6 md:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-3">
              💰 Spendly
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Track your spending, set budgets, and achieve your financial goals
              effortlessly.
            </p>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">
              Subscribe to our Newsletter
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get exclusive finance tips, tools, and updates straight to your
              inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center justify-center md:justify-start"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="rounded-r-none w-2/3 border-blue-300 dark:border-neutral-700"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" /> Subscribe
              </Button>
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-100 dark:border-neutral-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 dark:text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-blue-700 dark:text-blue-400">
              Spendly
            </span>
            . All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-5">
            <Link
              href="https://instagram.com"
              target="_blank"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </Link>

            <Link
              href="https://facebook.com"
              target="_blank"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </Link>

            <Link
              href="https://linkedin.com"
              target="_blank"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </Link>

            <Link
              href="https://twitter.com"
              target="_blank"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
