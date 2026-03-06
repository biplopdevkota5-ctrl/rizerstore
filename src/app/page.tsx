"use client";

import { useAppContext } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Rocket, ShieldCheck, Zap, Megaphone, Activity, ShoppingCart, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Home() {
  const { announcements, products, purchases, fundRequests } = useAppContext();
  const featuredProducts = products.slice(0, 3);

  // Combine recent activity for the live feed
  const recentActivities = [
    ...purchases.map(p => ({ type: 'purchase', user: p.username, item: p.productName, time: p.createdAt })),
    ...fundRequests.filter(r => r.status === 'approved').map(r => ({ type: 'deposit', user: r.username, amount: r.amount, time: r.createdAt }))
  ].sort((a, b) => b.time - a.time).slice(0, 5);

  return (
    <div className="flex flex-col gap-10 md:gap-16 pb-20 relative">
      <div className="scan-line" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
            <div className="flex flex-col gap-4 md:gap-6 text-center lg:text-left">
              <Badge className="w-fit mx-auto lg:mx-0 bg-primary/20 text-primary border-primary/30 py-1.5 px-4 rounded-full text-xs md:text-sm font-bold animate-pulse">
                Rizer Store v2.0 Live Now 🎮
              </Badge>
              <h1 className="font-headline text-4xl md:text-7xl font-bold tracking-tight leading-tight">
                Elite Gaming <br />
                <span className="text-primary neon-text">Assets Hub</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-xl max-w-lg mx-auto lg:mx-0">
                The most trusted platform for high-tier accounts, instant gift cards, and secure wallet management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" className="rounded-full h-12 md:h-14 px-8 md:px-10 text-base md:text-lg neon-glow w-full sm:w-auto font-bold" asChild>
                  <Link href="/store">Enter Store</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 md:h-14 px-8 md:px-10 text-base md:text-lg border-white/10 w-full sm:w-auto" asChild>
                  <Link href="/wallet">Add Funds</Link>
                </Button>
              </div>
              
              {/* Trust Stats */}
              <div className="flex items-center gap-6 md:gap-10 justify-center lg:justify-start pt-6 md:pt-8">
                 <div className="flex flex-col">
                   <span className="text-2xl md:text-4xl font-bold font-headline">99.9%</span>
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Uptime Rate</span>
                 </div>
                 <div className="h-10 w-px bg-white/10" />
                 <div className="flex flex-col">
                   <span className="text-2xl md:text-4xl font-bold font-headline">5k+</span>
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Active Gamers</span>
                 </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute -inset-1 rounded-full bg-primary/30 blur-[100px] animate-pulse" />
              <div className="relative glass-card rounded-[3rem] p-1 border border-white/10 overflow-hidden">
                <Image 
                  src="https://picsum.photos/seed/elite-gaming/800/600" 
                  alt="Elite Gaming" 
                  width={800} 
                  height={600}
                  className="rounded-[2.9rem] object-cover opacity-80"
                  data-ai-hint="gaming cyber"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                {/* Floating UI Elements */}
                <div className="absolute top-10 right-10">
                   <div className="glass-card p-4 rounded-2xl border-primary/30 neon-glow animate-bounce">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <Zap className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Instant Delivery</p>
                          <p className="text-[10px] text-muted-foreground">0.5s Avg speed</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Activity */}
      <section className="container mx-auto px-4">
        <div className="glass-card rounded-[2rem] border-primary/10 overflow-hidden">
           <div className="bg-primary/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Live Market Sync</span>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
           </div>
           <div className="flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-white/5">
              {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                <div key={i} className="flex-1 p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group">
                   <div className={cn(
                     "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                     act.type === 'purchase' ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-500'
                   )}>
                      {act.type === 'purchase' ? <ShoppingCart className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                   </div>
                   <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tighter truncate">
                        <span className="font-bold text-foreground">{act.user}</span> {act.type === 'purchase' ? 'bought' : 'deposited'}
                      </p>
                      <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                        {act.type === 'purchase' ? act.item : `Rs. ${act.amount?.toLocaleString()}`}
                      </p>
                   </div>
                </div>
              )) : (
                <div className="w-full p-4 text-center text-xs text-muted-foreground italic">
                  Waiting for market activity...
                </div>
              )}
           </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="glass-card rounded-2xl p-6 border-white/5 bg-primary/5 flex flex-col md:flex-row items-center gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary neon-glow">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold mb-1">System Announcement</h3>
              <p className="text-sm text-muted-foreground">{announcements[0].content}</p>
            </div>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary font-bold">Dismiss</Button>
          </div>
        </section>
      )}

      {/* Featured Grid */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Cyber Security", desc: "Multi-layer encryption for every fund transfer and account detail." },
            { icon: Rocket, title: "Mach-1 Delivery", desc: "Our automation bots deliver your assets in milliseconds after payment." },
            { icon: Gamepad2, title: "Global Inventory", desc: "Exclusive access to premium skins, high-tier accounts, and local gift cards." }
          ].map((feature, i) => (
            <Card key={i} className="glass-card border-white/5 group hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
              <CardContent className="p-8 flex flex-col gap-5 items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:neon-glow transition-all duration-500">
                  <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Store Preview */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-headline">Hot <span className="text-primary neon-text">Drops</span></h2>
          <Button variant="link" asChild className="text-primary font-bold text-lg p-0">
            <Link href="/store">View All Items</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <Card className="glass-card border-white/5 overflow-hidden h-full group-hover:border-primary/50 transition-all duration-500">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                  {product.tag && (
                    <Badge className="absolute top-4 left-4 bg-primary neon-glow px-4 py-1.5 text-xs font-black italic">
                      {product.tag}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">List Price</span>
                      <span className="text-2xl font-bold text-primary neon-text">Rs. {product.price.toLocaleString()}</span>
                    </div>
                    <Button size="sm" className="rounded-xl px-6 font-bold group-hover:neon-glow transition-all">Buy Now</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="container mx-auto px-4">
        <div className="glass-card rounded-[3rem] p-12 relative overflow-hidden text-center border-primary/20">
          <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-secondary/20 blur-[120px] rounded-full" />
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6">Need Support?</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Our specialized support team is online 24/7 to assist with your digital acquisitions and wallet synchronization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="rounded-full px-12 h-14 bg-[#25D366] hover:bg-[#1fb355] text-white border-none text-lg font-bold" onClick={() => window.open('https://wa.me/9805602394', '_blank')}>
              Open WhatsApp Support
            </Button>
            <Link href="/wallet" className="text-sm font-bold text-muted-foreground hover:text-white transition-colors underline underline-offset-8">
              Check Wallet Status
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
