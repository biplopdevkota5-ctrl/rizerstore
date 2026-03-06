"use client";

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

  if (!currentUser) {
    if (typeof window !== 'undefined') router.push('/auth?tab=login');
    return null;
  }

  const userPurchases = purchases.filter(p => p.userId === currentUser.id);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-3">
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
                 <div className="bg-primary/5 p-6 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r border-white/5 md:w-48">
                    <div className="flex items-center md:flex-col gap-3 md:gap-2">
                      <Package className="h-6 w-6 md:h-12 md:w-12 text-primary" />
                      <div className="flex flex-col md:items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Order ID</span>
                        <span className="text-xs font-mono text-muted-foreground">#{purchase.id}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30 md:mt-4 text-[10px]">COMPLETED</Badge>
                 </div>
                 
                 <div className="flex-1 p-5 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    <div className="space-y-1">
                       <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest">Product Name</p>
                       <h3 className="text-lg md:text-xl font-bold">{purchase.productName}</h3>
                    </div>
                    
                    <div className="space-y-1">
                       <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest">Amount Paid</p>
                       <p className="text-lg md:text-xl font-bold text-primary">Rs. {purchase.price.toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserIcon className="h-3 w-3 md:h-4 md:w-4" />
                        {purchase.contactMethod}: {purchase.contactId}
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end pt-2">
                       <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 border-white/10 text-xs h-9" onClick={() => window.open(`https://wa.me/9805602394`, '_blank')}>
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
             <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <History className="h-10 w-10 md:h-12 md:w-12" />
             </div>
             <div className="px-6">
                <h3 className="text-xl md:text-2xl font-bold">No orders found</h3>
                <p className="text-sm md:text-base text-muted-foreground">You haven't purchased anything yet.</p>
             </div>
             <Button asChild className="neon-glow px-8 md:px-10 rounded-full h-11 md:h-12">
                <Link href="/store">Start Shopping</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
