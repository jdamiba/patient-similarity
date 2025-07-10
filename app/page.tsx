"use client";
import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield,
  Rocket,
  Users,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Button from "./components/Button";
import Link from "next/link";

// Header Component
// EXTRACTED: See app/components/Header.tsx
import Header from "./components/Header";

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className,
}) => (
  <motion.div
    className={clsx(
      "group relative p-8 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300",
      className
    )}
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

// Pricing Card Component
interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  features,
  popular = false,
  className,
}) => (
  <motion.div
    className={clsx(
      "relative p-8 rounded-2xl border-2 bg-white",
      popular
        ? "border-blue-600 shadow-2xl scale-105"
        : "border-gray-200 hover:border-blue-300 hover:shadow-xl",
      "transition-all duration-300",
      className
    )}
    whileHover={{ y: popular ? 0 : -5 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    {popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}

    <div className="text-center mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <div className="flex items-baseline justify-center">
        <span className="text-5xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-500 ml-2">/{period}</span>
      </div>
    </div>

    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-600">{feature}</span>
        </li>
      ))}
    </ul>

    <Link href="/sign-up" legacyBehavior>
      <Button
        variant={popular ? "default" : "outline"}
        className="w-full"
        size="lg"
      >
        Get Started
      </Button>
    </Link>
  </motion.div>
);

// Main Landing Page Component
const ModernSaaSLanding = () => {
  const { isSignedIn } = useUser();
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

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Experience blazing fast performance with our optimized infrastructure and cutting-edge technology.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description:
        "Bank-grade security with end-to-end encryption, SOC 2 compliance, and advanced threat protection.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description:
        "Seamlessly collaborate with your team using real-time sync, comments, and advanced permissions.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Advanced Analytics",
      description:
        "Get deep insights with comprehensive analytics, custom reports, and predictive intelligence.",
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Easy Integration",
      description:
        "Connect with 100+ tools and platforms through our robust API and pre-built integrations.",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "24/7 Support",
      description:
        "Get help when you need it with our dedicated support team available around the clock.",
    },
  ];

  const pricingPlans = [
    {
      title: "Starter",
      price: "$9",
      period: "month",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Basic integrations",
        "Email support",
        "Mobile app access",
      ],
    },
    {
      title: "Professional",
      price: "$29",
      period: "month",
      popular: true,
      features: [
        "Up to 25 team members",
        "100GB storage",
        "Advanced integrations",
        "Priority support",
        "Advanced analytics",
        "Custom workflows",
      ],
    },
    {
      title: "Enterprise",
      price: "$99",
      period: "month",
      features: [
        "Unlimited team members",
        "1TB storage",
        "All integrations",
        "24/7 phone support",
        "Custom analytics",
        "SSO & advanced security",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
                <Star className="w-4 h-4 mr-2" />
                Empowering Patient Care Navigators
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Supercharge Patient Care Navigation
                <br />
                with <span className="text-blue-600">AI-Powered Insights</span>
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                The modern platform for patient care navigators to find similar
                patients, recommend personalized educational materials, and
                deliver proactive, compassionate support. Harness the power of
                AI-driven search and recommendations to improve outcomes and
                save time—so you can focus on what matters most: your patients.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/sign-up" legacyBehavior>
                  <Button size="lg" className="group">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </div>

              <div className="mt-12 text-sm text-gray-500">
                Built for care navigators • HIPAA-ready • No technical expertise
                required
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Powerful features designed to help your team collaborate better,
                make smarter decisions, and deliver exceptional results.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the perfect plan for your team. All plans include our
                core features with no hidden fees or surprise charges.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                title={plan.title}
                price={plan.price}
                period={plan.period}
                features={plan.features}
                popular={plan.popular}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of teams who have already revolutionized their
              productivity. Start your free trial today and see the difference.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white focus:ring-2 focus:ring-blue-400"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white focus:ring-2 focus:ring-blue-400"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Magellan</span>
              </div>
              <p className="text-gray-400 mb-6">
                Building the future of team collaboration, one feature at a
                time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Magellan. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernSaaSLanding;
