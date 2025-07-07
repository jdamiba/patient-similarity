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
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";

// Button Component
interface NavButton {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const Button: React.FC<NavButton> = ({
  className,
  children,
  variant = "default",
  size = "md",
  onClick,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={clsx(baseClasses, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
};

// Header Component
interface NavItem {
  to?: string;
  text: string;
  items?: {
    text: string;
    description?: string;
    to: string;
  }[];
}

interface HeaderProps {
  className?: string;
  logo?: React.ReactNode;
  menuItems?: NavItem[];
  rightContent?: React.ReactNode;
}

const ChevronIcon = () => <ChevronDown className="w-4 h-4 opacity-60" />;

const Navigation: React.FC<{ items: NavItem[] }> = ({ items }) => (
  <nav className="hidden lg:block">
    <ul className="flex gap-x-8">
      {items.map(({ to, text, items }, index) => {
        const Tag = to ? "a" : "button";
        return (
          <li
            className={clsx(
              "relative [perspective:2000px]",
              Array.isArray(items) && items.length > 0 && "group"
            )}
            key={index}
          >
            <Tag
              className="flex items-center gap-x-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              href={to}
            >
              {text}
              {Array.isArray(items) && items.length > 0 && <ChevronIcon />}
            </Tag>
            {Array.isArray(items) && items.length > 0 && (
              <div className="absolute -left-5 top-full w-[300px] pt-5 pointer-events-none opacity-0 origin-top-left transition-[opacity,transform] duration-200 [transform:rotateX(-12deg)_scale(0.9)] group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-hover:[transform:none]">
                <ul className="relative flex min-w-[248px] flex-col gap-y-0.5 rounded-xl border border-gray-200 bg-white shadow-xl p-2.5">
                  {Array.isArray(items) &&
                    items.map(({ text, description, to }, index) => (
                      <li key={index}>
                        <a
                          className="group/link relative flex items-center overflow-hidden whitespace-nowrap rounded-xl p-3 hover:bg-gray-50 transition-colors"
                          href={to}
                        >
                          <div className="relative z-10">
                            <span className="block text-sm font-medium text-gray-900">
                              {text}
                            </span>
                            {description && (
                              <span className="mt-0.5 block text-sm text-gray-500">
                                {description}
                              </span>
                            )}
                          </div>
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  </nav>
);

const Header: React.FC<HeaderProps> = ({
  className,
  logo,
  menuItems = [],
  rightContent,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header
      className={clsx(
        "relative z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {logo}
          <Navigation items={menuItems} />
          <div className="flex items-center gap-x-4">
            {rightContent}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

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

    <Button
      variant={popular ? "default" : "outline"}
      className="w-full"
      size="lg"
    >
      Get Started
    </Button>
  </motion.div>
);

// Testimonial Component
interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

const TestimonialCard: React.FC<TestimonialProps> = ({
  content,
  author,
  role,
  company,
  avatar,
}) => (
  <motion.div
    className="p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-xl transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-600 mb-6 leading-relaxed">"{content}"</p>
    <div className="flex items-center">
      <img src={avatar} alt={author} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <h4 className="font-semibold text-gray-900">{author}</h4>
        <p className="text-gray-500 text-sm">
          {role} at {company}
        </p>
      </div>
    </div>
  </motion.div>
);

// Stats Component
const StatsSection = () => (
  <section className="py-20 bg-blue-600">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { number: "10K+", label: "Active Users" },
          { number: "99.9%", label: "Uptime" },
          { number: "50+", label: "Countries" },
          { number: "24/7", label: "Support" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
              {stat.number}
            </div>
            <div className="text-blue-100">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// Main Landing Page Component
const ModernSaaSLanding = () => {
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

  const testimonials = [
    {
      content:
        "This platform has completely transformed how our team collaborates. The intuitive interface and powerful features have boosted our productivity by 300%.",
      author: "Sarah Johnson",
      role: "Product Manager",
      company: "TechCorp",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      content:
        "The best investment we've made for our business. The analytics insights have helped us make data-driven decisions that increased our revenue significantly.",
      author: "Michael Chen",
      role: "CEO",
      company: "StartupXYZ",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      content:
        "Outstanding customer support and a product that actually delivers on its promises. We've been using it for 2 years and couldn't be happier.",
      author: "Emily Rodriguez",
      role: "Operations Director",
      company: "GrowthCo",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
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
            <span className="text-xl font-bold text-gray-900">SaaSify</span>
          </div>
        }
        menuItems={menuItems}
        rightContent={
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
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
                Trusted by 10,000+ teams worldwide
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Build Better
                <span className="text-blue-600"> Products</span>
                <br />
                Faster Than Ever
              </h1>

              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                The all-in-one platform that helps teams collaborate, analyze,
                and ship products that customers love. Join thousands of
                companies already building the future.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>

              <div className="mt-12 text-sm text-gray-500">
                No credit card required • 14-day free trial • Cancel anytime
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

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

      {/* Testimonials Section */}
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
                Loved by teams everywhere
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don't just take our word for it. Here's what our customers have
                to say about their experience with our platform.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                content={testimonial.content}
                author={testimonial.author}
                role={testimonial.role}
                company={testimonial.company}
                avatar={testimonial.avatar}
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
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
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
                <span className="text-xl font-bold">SaaSify</span>
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
              © 2024 SaaSify. All rights reserved.
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
