"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Wallet, 
  History, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon,
  Menu,
  ShieldCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { currentUser, logout } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Secret Click Logic
  const logoClicks = useRef(0);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    logoClicks.current += 1;
    
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    
    clickTimeout.current = setTimeout(() => {
      logoClicks.current = 0;
    }, 2000);

    if (logoClicks.current >= 10) {
      toast({ title: "Authorized Access", description: "Navigating to Admin Panel..." });
      router.push('/admin/dashboard');
      logoClicks.current = 0;
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Gamepad2 },
    { href: "/store", label: "Store", icon: Wallet },
  ];

  const userLinks = [
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/history", label: "Orders", icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer select-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary neon-glow">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline text-xl font-bold tracking-tight neon-text">
              RIZER <span className="text-primary">STORE</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <div className="hidden sm:flex items-center gap-3 rounded-full bg-muted/50 px-4 py-1.5 border border-white/5">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">Rs. {currentUser.balance.toLocaleString()}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border border-white/5">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{currentUser.username}</span>
                      <span className="text-xs font-normal text-muted-foreground">{currentUser.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentUser.role === 'admin' ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    userLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href} className="flex items-center gap-2">
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/auth?tab=login">Login</Link>
              </Button>
              <Button asChild className="neon-glow">
                <Link href="/auth?tab=signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-card">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium"
                  >
                    <link.icon className="h-5 w-5 text-primary" />
                    {link.label}
                  </Link>
                ))}
                {currentUser && userLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium"
                  >
                    <link.icon className="h-5 w-5 text-primary" />
                    {link.label}
                  </Link>
                ))}
                {!currentUser && (
                   <Link
                    href="/auth?tab=login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium"
                  >
                    <LogOut className="h-5 w-5 text-primary" />
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
