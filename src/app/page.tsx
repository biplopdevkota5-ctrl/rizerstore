"use client";

import { useAppContext } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Rocket, ShieldCheck, Zap, Megaphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { announcements, products } = useAppContext();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <Badge className="w-fit mx-auto lg:mx-0 bg-primary/20 text-primary border-primary/30 py-1.5 px-4 rounded-full text-sm font-bold">
                Level Up Your Gaming Experience 🎮
              </Badge>
              <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                Premium Gaming <br />
                <span className="text-primary neon-text">Marketplace</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto lg:mx-0">
                Buy high-tier game accounts, gift cards, and top-ups instantly. Secure transactions with instant delivery.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" className="rounded-full h-14 px-10 text-lg neon-glow" asChild>
                  <Link href="/store">Browse Store</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg border-white/10" asChild>
                  <Link href="/wallet">Add Funds</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 justify-center lg:justify-start pt-8">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-bold">5k+</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Active Users</span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-bold">10k+</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Successful Sales</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute -inset-1 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative glass-card rounded-3xl p-8 border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden group">
                <Image 
                  src="https://picsum.photos/seed/hero-gaming/800/600" 
                  alt="Gaming Setup" 
                  width={800} 
                  height={600}
                  className="rounded-2xl object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-12 left-12 right-12">
                   <Card className="glass-card border-white/10 neon-glow">
                     <CardContent className="p-4 flex items-center gap-4">
                       <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                         <Zap className="text-white h-6 w-6" />
                       </div>
                       <div>
                         <p className="font-bold">Instant Delivery</p>
                         <p className="text-xs text-muted-foreground">Accounts delivered in seconds</p>
                       </div>
                     </CardContent>
                   </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-6 border-white/5 bg-primary/5 flex flex-col md:flex-row items-center gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold mb-1">Latest Announcements</h3>
              <p className="text-muted-foreground">{announcements[0].content}</p>
            </div>
            <Button variant="link" className="text-primary font-bold">View All</Button>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "100% Secure", desc: "Every transaction is encrypted and verified for your safety." },
            { icon: Rocket, title: "Lightning Fast", desc: "No waiting time. Get your codes and accounts immediately." },
            { icon: Gamepad2, title: "Wide Variety", desc: "From Valorant to PUBG, we have items for every popular game." }
          ].map((feature, i) => (
            <Card key={i} className="glass-card border-white/5 group hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-8 flex flex-col gap-4 items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-headline">Featured <span className="text-primary">Deals</span></h2>
          <Button variant="link" asChild className="text-primary font-bold text-lg">
            <Link href="/store">View Store</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <Card className="glass-card border-white/5 overflow-hidden h-full group-hover:border-primary/50 transition-all duration-500">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.tag && (
                    <Badge className="absolute top-4 left-4 bg-primary neon-glow px-3 py-1 font-bold">
                      {product.tag}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Button className="w-full h-12 rounded-xl font-bold">Buy Now</Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary neon-text">Rs. {product.price.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Support CTA */}
      <section className="container mx-auto px-4 mt-8">
        <div className="glass-card rounded-[3rem] p-12 relative overflow-hidden text-center border-white/5">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 blur-[100px] -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-secondary/20 blur-[100px] -ml-20 -mb-20" />
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6">Need Any Help?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Our support team is available 24/7 to help you with your purchases or any queries about our products.
          </p>
          <Button size="lg" className="rounded-full px-12 h-14 bg-[#25D366] hover:bg-[#1fb355] text-white border-none" onClick={() => window.open('https://wa.me/9805602394', '_blank')}>
            Contact Support on WhatsApp
          </Button>
        </div>
      </section>
    </div>
  );
}