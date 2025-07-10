"use client";
import React, { useEffect, useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Rocket } from "lucide-react";
import Header from "../components/Header";
import Button from "../components/Button";
import PatientList from "../../components/ui/PatientList";
import type { Patient } from "../../components/ui/PatientList";
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

export default function DashboardPage() {
  const { isSignedIn } = useUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/patients", { method: "GET" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unknown error");
        setPatients(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load patients.");
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

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
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )
        }
      />
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-8 py-16 px-4 mt-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
          My Patients
        </h1>
        <PatientList patients={patients} isLoading={loading} error={error} />
      </div>
    </div>
  );
}
