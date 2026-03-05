"use client";

import { Zap, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const transformerLinks = [
  {
    title: "All Transformers",
    href: "/transformers",
    description: "Browse our complete transformer catalog",
  },
  {
    title: "Padmount",
    href: "/transformers/padmount",
    description: "Ground-level units for underground distribution",
  },
  {
    title: "Substation",
    href: "/transformers/substation",
    description: "High-capacity power transformers 10-500+ MVA",
  },
  {
    title: "Distribution",
    href: "/transformers/distribution",
    description: "Pole-mount and platform transformers",
  },
  {
    title: "Dry-Type",
    href: "/transformers/dry-type",
    description: "Air-cooled for indoor and fire-sensitive areas",
  },
];

const solutionLinks = [
  {
    title: "Data Centers",
    href: "/solutions/data-centers",
    description: "Power infrastructure for hyperscale facilities",
  },
  {
    title: "Renewable Energy",
    href: "/solutions/renewable-energy",
    description: "Solar, wind, and battery storage solutions",
  },
  {
    title: "EV Infrastructure",
    href: "/solutions/ev-infrastructure",
    description: "Charging stations and fleet electrification",
  },
  {
    title: "Industrial",
    href: "/solutions/industrial",
    description: "Manufacturing, mining, and heavy industry",
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      {/* American flag red accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[hsl(348,74%,40%)]" />
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:shadow-[0_0_20px_hsl(205_100%_50%/0.5)] transition-all duration-300">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl tracking-wide text-foreground">
              FLUXCO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            <NavigationMenu>
              <NavigationMenuList>
                {/* About - simple link */}
                <NavigationMenuItem>
                  <Link
                    href={isHomePage ? "#about" : "/#about"}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider px-4 py-2"
                  >
                    About
                  </Link>
                </NavigationMenuItem>

                {/* Products Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-primary bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-sm uppercase tracking-wider">
                    Products
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {transformerLinks.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">
                                {link.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Solutions Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-primary bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-sm uppercase tracking-wider">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {solutionLinks.map((link) => (
                        <li key={link.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">
                                {link.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {link.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Inventory - simple link */}
                <NavigationMenuItem>
                  <Link
                    href="/inventory"
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider px-4 py-2"
                  >
                    Inventory
                  </Link>
                </NavigationMenuItem>

                {/* Resources - simple link */}
                <NavigationMenuItem>
                  <Link
                    href="/resources"
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider px-4 py-2"
                  >
                    Resources
                  </Link>
                </NavigationMenuItem>

                {/* Contact - simple link */}
                <NavigationMenuItem>
                  <Link
                    href={isHomePage ? "#contact" : "/#contact"}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider px-4 py-2"
                  >
                    Contact
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Customer Login Button */}
            <Button asChild variant="outline" className="ml-2 h-12 px-3">
              <Link href="/customer/login" className="flex flex-col items-center text-xs leading-tight">
                <span>Customer</span>
                <span>Login</span>
              </Link>
            </Button>

            {/* OEM Login Button */}
            <Button asChild variant="outline" className="h-12 px-3">
              <Link href="/portal/login" className="flex flex-col items-center text-xs leading-tight">
                <span>OEM</span>
                <span>Login</span>
              </Link>
            </Button>

            {/* Spec Builder Button */}
            <Button asChild variant="hero" className="h-12 px-3">
              <Link href="/specbuilder" className="flex flex-col items-center text-xs leading-tight">
                <span>Spec</span>
                <span>Builder</span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 border-t border-border animate-fade-up">
            <div className="flex flex-col gap-2">
              {/* About */}
              <Link
                href={isHomePage ? "#about" : "/#about"}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider py-2"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>

              {/* Products Submenu */}
              <div>
                <button
                  onClick={() =>
                    setMobileSubmenu(
                      mobileSubmenu === "products" ? null : "products"
                    )
                  }
                  className="flex items-center justify-between w-full text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider py-2"
                >
                  Products
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      mobileSubmenu === "products" && "rotate-180"
                    )}
                  />
                </button>
                {mobileSubmenu === "products" && (
                  <div className="pl-4 flex flex-col gap-2 mt-2">
                    {transformerLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm py-1"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Solutions Submenu */}
              <div>
                <button
                  onClick={() =>
                    setMobileSubmenu(
                      mobileSubmenu === "solutions" ? null : "solutions"
                    )
                  }
                  className="flex items-center justify-between w-full text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider py-2"
                >
                  Solutions
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      mobileSubmenu === "solutions" && "rotate-180"
                    )}
                  />
                </button>
                {mobileSubmenu === "solutions" && (
                  <div className="pl-4 flex flex-col gap-2 mt-2">
                    {solutionLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm py-1"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Inventory */}
              <Link
                href="/inventory"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider py-2"
                onClick={() => setIsOpen(false)}
              >
                Inventory
              </Link>

              {/* Resources */}
              <Link
                href="/resources"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider py-2"
                onClick={() => setIsOpen(false)}
              >
                Resources
              </Link>

              {/* Contact */}
              <Link
                href={isHomePage ? "#contact" : "/#contact"}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm uppercase tracking-wider py-2"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              <Button asChild variant="outline" size="lg" className="mt-4">
                <Link href="/customer/login" onClick={() => setIsOpen(false)}>
                  Customer Login
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/portal/login" onClick={() => setIsOpen(false)}>
                  OEM Login
                </Link>
              </Button>

              <Button asChild variant="hero" size="lg">
                <Link href="/specbuilder" onClick={() => setIsOpen(false)}>
                  Spec Builder
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
