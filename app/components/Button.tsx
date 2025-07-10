import * as React from "react";
import clsx from "clsx";

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

export default Button;
