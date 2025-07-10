"use client";
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import Header from "../components/Header";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Rocket } from "lucide-react";
import Button from "../components/Button";
import Link from "next/link";

interface QdrantResult {
  id: string;
  score?: number;
  payload?: {
    name?: string;
    file?: string;
    [key: string]: unknown;
  };
}

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QdrantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isSignedIn } = useUser();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeText: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 py-16 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Search
        </h1>
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black placeholder-gray-400"
            placeholder="Type your search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition flex items-center gap-2"
            disabled={loading || !query.trim()}
          >
            Search <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        <div className="mt-6">
          {loading && (
            <div className="text-blue-600 text-center">Searching...</div>
          )}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-gray-100 rounded-lg p-4 shadow"
                >
                  <div className="font-bold text-blue-800 text-lg">
                    {result.payload?.name || "Unknown Name"}
                  </div>
                  <div className="text-gray-600 text-sm">ID: {result.id}</div>
                  {result.payload?.file && (
                    <div className="text-gray-500 text-xs mt-1">
                      File: {result.payload.file}
                    </div>
                  )}
                  {typeof result.score === "number" && (
                    <div className="mt-2 text-right">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono text-sm">
                        Score: {result.score.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!loading && !error && results.length === 0 && (
            <div className="text-gray-400 text-center">
              No results yet. Try searching for something!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
