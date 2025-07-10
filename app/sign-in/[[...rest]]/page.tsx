"use client";

export const dynamic = "force-dynamic";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { Rocket } from "lucide-react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const menuItems = [
  {
    text: "Product",
    items: [
      {
        text: "Features",
        description: "Explore our powerful features",
        to: "/features",
      },
      {
        text: "Integrations",
        description: "Connect with your tools",
        to: "/integrations",
      },
      { text: "API", description: "Build with our API", to: "/api" },
    ],
  },
  { text: "Pricing", to: "/pricing" },
  { text: "About", to: "/about" },
  { text: "Contact", to: "/contact" },
];

export default function SignInPage() {
  const { isSignedIn } = useUser();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header
        logo={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Magellan</span>
          </div>
        }
        menuItems={menuItems}
        rightContent={
          isSignedIn ? (
            <div className="flex items-center space-x-4">
              <a href="/dashboard">
                <Button size="sm" variant="default">
                  Dashboard
                </Button>
              </a>
              <SignOutButton>
                <Button size="sm" variant="ghost">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/sign-in" legacyBehavior>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" legacyBehavior>
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )
        }
      />
      <div className="flex justify-center items-center flex-1 w-full">
        <SignIn path="/sign-in" routing="path" />
      </div>
    </div>
  );
}
