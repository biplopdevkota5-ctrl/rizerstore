"use client";

import { useAppContext } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, ExternalLink, Package, Calendar, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { currentUser, purchases } = useAppContext();
  const router = useRouter();

  if (!currentUser) {
    if (typeof window !== 'undefined') router.push('/auth?tab=login');
    return null;
  }

  const userPurchases = purchases.filter(p => p.userId === currentUser.id);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            Purchase <span className="text-primary">History</span>
          </h1>
          <p className="text-muted-foreground">Manage your digital assets and past orders</p>
        </div>
      </div>

      <div className="space-y-6">
        {userPurchases.length > 0 ? (
          userPurchases.sort((a, b) => b.createdAt - a.createdAt).map((purchase) => (
            <Card key={purchase.id} className="glass-card border-white/5 hover:border-primary/30 transition-all duration-300 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                 <div className="bg-primary/5 p-8 flex flex-col items-center justify-center border-r border-white/5 md:w-48">
                    <Package className="h-12 w-12 text-primary mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Order ID</span>
                    <span className="text-xs font-mono text-muted-foreground">#{purchase.id}</span>
                 </div>
                 
                 <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                       <p className="text-sm text-muted-foreground">Product Name</p>
                       <h3 className="text-xl font-bold">{purchase.productName}</h3>
                    </div>
                    
                    <div className="space-y-1">
                       <p className="text-sm text-muted-foreground">Amount Paid</p>
                       <p className="text-xl font-bold text-primary">Rs. {purchase.price.toLocaleString()}</p>
                    </div>

                    <div className="space-y-1">
                       <p className="text-sm text-muted-foreground">Status</p>
                       <Badge className="bg-green-500/20 text-green-500 border-green-500/30">COMPLETED</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Calendar className="h-4 w-4" />
                       {new Date(purchase.createdAt).toLocaleDateString()} at {new Date(purchase.createdAt).toLocaleTimeString()}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <UserIcon className="h-4 w-4" />
                       {purchase.contactMethod}: {purchase.contactId}
                    </div>

                    <div className="flex items-end justify-end">
                       <Button variant="outline" size="sm" className="gap-2 border-white/10" onClick={() => window.open(`https://wa.me/9805602394`, '_blank')}>
                          Contact Support
                          <ExternalLink className="h-3 w-3" />
                       </Button>
                    </div>
                 </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center gap-6 glass-card rounded-3xl border-white/5">
             <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <History className="h-12 w-12" />
             </div>
             <div>
                <h3 className="text-2xl font-bold">No orders found</h3>
                <p className="text-muted-foreground">You haven't purchased anything yet.</p>
             </div>
             <Button asChild className="neon-glow px-10 rounded-full h-12">
                <Link href="/store">Start Shopping</Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}