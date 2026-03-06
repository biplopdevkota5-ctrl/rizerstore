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
    <div className="flex flex-col gap-10 md:gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
            <div className="flex flex-col gap-4 md:gap-6 text-center lg:text-left">
              <Badge className="w-fit mx-auto lg:mx-0 bg-primary/20 text-primary border-primary/30 py-1.5 px-4 rounded-full text-xs md:text-sm font-bold">
                Level Up Your Gaming Experience 🎮
              </Badge>
              <h1 className="font-headline text-4xl md:text-7xl font-bold tracking-tight leading-tight">
                Premium Gaming <br />
                <span className="text-primary neon-text">Marketplace</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-xl max-w-lg mx-auto lg:mx-0">
                Buy high-tier game accounts, gift cards, and top-ups instantly. Secure transactions with instant delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" className="rounded-full h-12 md:h-14 px-8 md:px-10 text-base md:text-lg neon-glow w-full sm:w-auto" asChild>
                  <Link href="/store">Browse Store</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 md:h-14 px-8 md:px-10 text-base md:text-lg border-white/10 w-full sm:w-auto" asChild>
                  <Link href="/wallet">Add Funds</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 md:gap-8 justify-center lg:justify-start pt-6 md:pt-8">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl md:text-2xl font-bold">5k+</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">Active Users</span>
                </div>
                <div className="h-8 md:h-10 w-px bg-white/10" />
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl md:text-2xl font-bold">10k+</span>
                  <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">Successful Sales</span>
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
          <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-6 border-white/5 bg-primary/5 flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-primary/20 text-primary">
              <Megaphone className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-base md:text-lg font-bold mb-0.5 md:mb-1">Latest Announcements</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{announcements[0].content}</p>
            </div>
            <Button variant="link" className="text-primary font-bold text-sm h-auto p-0 md:p-4">View All</Button>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: ShieldCheck, title: "100% Secure", desc: "Every transaction is encrypted and verified for your safety." },
            { icon: Rocket, title: "Lightning Fast", desc: "No waiting time. Get your codes and accounts immediately." },
            { icon: Gamepad2, title: "Wide Variety", desc: "From Valorant to PUBG, we have items for every popular game." }
          ].map((feature, i) => (
            <Card key={i} className="glass-card border-white/5 group hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6 md:p-8 flex flex-col gap-3 md:gap-4 items-center text-center">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold font-headline">{feature.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-headline">Featured <span className="text-primary">Deals</span></h2>
          <Button variant="link" asChild className="text-primary font-bold text-sm md:text-lg p-0 h-auto">
            <Link href="/store">View Store</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                    <Badge className="absolute top-4 left-4 bg-primary neon-glow px-3 py-1 text-[10px] md:text-xs font-bold">
                      {product.tag}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Button className="w-full h-12 rounded-xl font-bold hidden md:flex">Buy Now</Button>
                  </div>
                </div>
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg md:text-2xl font-bold text-primary neon-text">Rs. {product.price.toLocaleString()}</span>
                    <Button size="sm" className="md:hidden">Buy</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Support CTA */}
      <section className="container mx-auto px-4 mt-4 md:mt-8">
        <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 relative overflow-hidden text-center border-white/5">
          <div className="absolute top-0 right-0 h-32 md:h-40 w-32 md:w-40 bg-primary/20 blur-[80px] md:blur-[100px] -mr-16 -mt-16 md:-mr-20 md:-mt-20" />
          <div className="absolute bottom-0 left-0 h-32 md:h-40 w-32 md:w-40 bg-secondary/20 blur-[80px] md:blur-[100px] -ml-16 -mb-16 md:-ml-20 md:-mb-20" />
          <h2 className="text-2xl md:text-5xl font-bold font-headline mb-4 md:mb-6">Need Any Help?</h2>
          <p className="text-muted-foreground text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
            Our support team is available 24/7 to help you with your purchases or any queries about our products.
          </p>
          <Button size="lg" className="rounded-full px-8 md:px-12 h-12 md:h-14 bg-[#25D366] hover:bg-[#1fb355] text-white border-none w-full sm:w-auto text-sm md:text-base" onClick={() => window.open('https://wa.me/9805602394', '_blank')}>
            Contact Support on WhatsApp
          </Button>
        </div>
      </section>
    </div>
  );
}
