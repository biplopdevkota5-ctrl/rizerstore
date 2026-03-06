"use client";

import { useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, ExternalLink, Package, Calendar, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HistoryPage() {
  const { currentUser, purchases } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth?tab=login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  const userPurchases = purchases.filter(p => p.userId === currentUser.id);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 text-center md:text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center justify-center md:justify-start gap-3">
            <History className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Purchase <span className="text-primary">History</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your digital assets and past orders</p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {userPurchases.length > 0 ? (
          userPurchases.sort((a, b) => b.createdAt - a.createdAt).map((purchase) => (
            <Card key={purchase.id} className="glass-card border-white/5 hover:border-primary/30 transition-all duration-300 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                 <div className="bg-primary/5 p-4 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r border-white/5 md:w-48">
                    <div className="flex items-center md:flex-col gap-3 md:gap-2">
                      <Package className="h-5 w-5 md:h-10 md:w-10 text-primary" />
                      <div className="flex flex-col md:items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Order ID</span>
                        <span className="text-[10px] md:text-xs font-mono text-muted-foreground">#{purchase.id}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[10px]">COMPLETED</Badge>
                 </div>
                 
                 <div className="flex-1 p-5 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-1">
                       <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest">Product Name</p>
                       <h3 className="text-base md:text-xl font-bold">{purchase.productName}</h3>
                    </div>
                    
                    <div className="space-y-1">
                       <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest">Amount Paid</p>
                       <p className="text-base md:text-xl font-bold text-primary">Rs. {purchase.price.toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col gap-1 md:gap-2">
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                        <UserIcon className="h-3 w-3" />
                        {purchase.contactMethod}: {purchase.contactId}
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end pt-2">
                       <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 border-white/10 text-[10px] h-8" onClick={() => window.open(`https://wa.me/9805602394`, '_blank')}>
                          Contact Support
                          <ExternalLink className="h-3 w-3" />
                       </Button>
                    </div>
                 </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-16 md:py-20 text-center flex flex-col items-center gap-6 glass-card rounded-2xl md:rounded-3xl border-white/5">
             <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <History className="h-8 w-8 md:h-12 md:w-12" />
             </div>
             <div className="px-6">
                <h3 className="text-lg md:text-2xl font-bold">No orders found</h3>
                <p className="text-xs md:text-base text-muted-foreground">You haven't purchased anything yet.</p>
             </div>
             <Button asChild className="neon-glow px-8 md:px-10 rounded-full h-10 md:h-12 text-sm">
                <Link href="/store">Start Shopping</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
