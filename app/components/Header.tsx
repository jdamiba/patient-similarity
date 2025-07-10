import * as React from "react";
import clsx from "clsx";
import { ChevronDown, X, Menu } from "lucide-react";

export interface NavItem {
  to?: string;
  text: string;
  items?: {
    text: string;
    description?: string;
    to: string;
  }[];
}

export interface HeaderProps {
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
        const Tag: React.ElementType = to ? "a" : "button";
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

export default Header;
