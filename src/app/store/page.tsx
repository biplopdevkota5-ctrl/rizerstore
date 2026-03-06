"use client";

import { useAppContext } from "@/lib/context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function StorePage() {
  const { products } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold font-headline mb-2">Game <span className="text-primary">Shop</span></h1>
            <p className="text-muted-foreground">Browse our collection of premium gaming assets</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 h-11 bg-muted/50 border-white/5" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 border-white/5">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group">
                <Card className="glass-card border-white/5 overflow-hidden h-full group-hover:border-primary/50 transition-all duration-500">
                  <div className="relative aspect-square overflow-hidden">
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
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Price</span>
                        <span className="text-xl font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
                      </div>
                      <Button size="sm" className="rounded-lg h-9 font-bold px-4">Buy</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters</p>
              <Button variant="link" onClick={() => setSearchQuery('')} className="text-primary font-bold">Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}