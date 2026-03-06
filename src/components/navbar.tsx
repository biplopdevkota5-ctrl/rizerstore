
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
  ShieldCheck,
  CreditCard
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { currentUser, logout, isLoading } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Secret Click Logic for Admin
  const logoClicks = useRef(0);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    logoClicks.current += 1;
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => {
      logoClicks.current = 0;
    }, 2000);

    if (logoClicks.current >= 10) {
      toast({ title: "Authorized", description: "Entering Admin Portal..." });
      router.push('/admin/dashboard');
      logoClicks.current = 0;
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Gamepad2 },
    { href: "/store", label: "Store", icon: CreditCard },
  ];

  const userLinks = [
    { href: "/wallet", label: "My Wallet", icon: Wallet },
    { href: "/history", label: "Order History", icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer select-none group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary transition-transform group-hover:scale-110 neon-glow">
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

        {/* User Section */}
        <div className="flex items-center gap-3">
          {!isLoading && currentUser ? (
            <>
              {/* Wallet Balance Badge */}
              <Link href="/wallet" className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20 hover:bg-primary/20 transition-colors">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">Rs. {(currentUser.balance || 0).toLocaleString()}</span>
              </Link>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border border-white/5 hover:bg-primary/10">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white text-xs font-bold">
                        {currentUser.username?.substring(0, 2).toUpperCase() || 'GA'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass-card p-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{currentUser.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  
                  {currentUser.role === 'admin' && (
                    <DropdownMenuItem asChild className="focus:bg-primary/20 cursor-pointer">
                      <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {userLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild className="focus:bg-primary/20 cursor-pointer">
                      <Link href={link.href} className="flex items-center gap-2">
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : !isLoading ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex hover:text-primary transition-colors">
                <Link href="/auth?tab=login">Login</Link>
              </Button>
              <Button asChild className="neon-glow rounded-full px-6">
                <Link href="/auth?tab=signup">Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-card border-l border-white/5">
              <div className="flex flex-col gap-6 mt-12">
                <div className="flex flex-col gap-1 px-2 mb-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Navigation</span>
                  <div className="h-px bg-white/5 w-full mt-1" />
                </div>
                
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 text-lg font-medium p-2 rounded-xl transition-colors",
                      pathname === link.href ? "bg-primary/10 text-primary" : "hover:bg-white/5"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}

                {currentUser && (
                  <>
                    <div className="flex flex-col gap-1 px-2 mt-4 mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Account</span>
                      <div className="h-px bg-white/5 w-full mt-1" />
                    </div>
                    {userLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-4 text-lg font-medium p-2 rounded-xl transition-colors",
                          pathname === link.href ? "bg-primary/10 text-primary" : "hover:bg-white/5"
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => { setIsOpen(false); logout(); }}
                      className="flex items-center gap-4 text-lg font-medium p-2 rounded-xl text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
