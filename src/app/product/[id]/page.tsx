"use client";

import { use, useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ShieldCheck, 
  Zap, 
  ArrowLeft, 
  ShoppingCart,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products, currentUser, syncData } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [contactMethod, setContactMethod] = useState('');
  const [contactId, setContactId] = useState('');
  const [isBuying, setIsBuying] = useState(false);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-40 text-center">
        <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
        <Button asChild><Link href="/store">Back to Store</Link></Button>
      </div>
    );
  }

  const handlePurchase = () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "You must be logged in to purchase items.", variant: "destructive" });
      router.push('/auth?tab=login');
      return;
    }

    if (currentUser.balance < product.price) {
      toast({ title: "Insufficient Funds", description: "Your wallet balance is too low. Please add funds.", variant: "destructive" });
      router.push('/wallet');
      return;
    }

    if (!contactMethod || !contactId) {
      toast({ title: "Contact Info Required", description: "Please provide a contact method for delivery.", variant: "destructive" });
      return;
    }

    setIsBuying(true);

    // Simulate purchase
    setTimeout(() => {
      const allUsers = db.getUsers();
      const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
      
      if (userIndex !== -1) {
        allUsers[userIndex].balance -= product.price;
        db.saveUsers(allUsers);
        
        const purchases = db.getPurchases();
        const newPurchase = {
          id: Math.random().toString(36).substring(7),
          userId: currentUser.id,
          username: currentUser.username,
          productId: product.id,
          productName: product.name,
          price: product.price,
          contactMethod,
          contactId,
          status: 'completed' as const,
          createdAt: Date.now()
        };
        db.savePurchases([...purchases, newPurchase]);
        
        syncData();
        toast({ title: "Purchase Successful!", description: "Redirecting to WhatsApp for delivery..." });

        const whatsappMsg = encodeURIComponent(`Hey Rizer Store, I just bought ${product.name} for ${product.price}. Please give me the ID and password for the account I purchased. My Contact ID: ${contactId} (${contactMethod})`);
        window.open(`https://wa.me/9805602394?text=${whatsappMsg}`, '_blank');
        
        router.push('/history');
      }
      setIsBuying(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/store" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Image */}
        <div className="space-y-6">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden glass-card border-white/5 neon-glow">
            <Image 
              src={product.imageUrl} 
              alt={product.name} 
              fill 
              className="object-cover"
            />
            {product.tag && (
              <Badge className="absolute top-6 left-6 bg-primary neon-glow text-lg px-4 py-1.5 font-bold">
                {product.tag}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <Card className="glass-card border-white/5">
               <CardContent className="p-4 flex items-center gap-3">
                 <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
                 <div>
                   <p className="font-bold text-sm">Safe & Secure</p>
                   <p className="text-xs text-muted-foreground">Verified gaming items</p>
                 </div>
               </CardContent>
             </Card>
             <Card className="glass-card border-white/5">
               <CardContent className="p-4 flex items-center gap-3">
                 <Zap className="h-8 w-8 text-primary shrink-0" />
                 <div>
                   <p className="font-bold text-sm">Direct Delivery</p>
                   <p className="text-xs text-muted-foreground">Instant support</p>
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-bold font-headline mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary neon-text">Rs. {product.price.toLocaleString()}</span>
              <Badge variant="outline" className="text-muted-foreground border-white/10 uppercase tracking-widest px-3">Available Now</Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          <Card className="glass-card border-white/5 p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <ShoppingCart className="h-5 w-5" />
                <h3 className="font-bold text-xl">Purchase Item</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Delivery Contact Method</Label>
                  <Select onValueChange={setContactMethod}>
                    <SelectTrigger className="bg-muted/50 border-white/10">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Discord">Discord</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Telegram">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Username or Contact ID</Label>
                  <Input 
                    placeholder="e.g. @rizer_gamer" 
                    className="bg-muted/50 border-white/10"
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your Balance:</span>
                <span className={cn(
                  "font-bold",
                  currentUser && currentUser.balance >= product.price ? "text-green-400" : "text-destructive"
                )}>
                  Rs. {currentUser ? currentUser.balance.toLocaleString() : '0'}
                </span>
              </div>
              
              <Button 
                className="w-full h-14 text-lg font-bold neon-glow"
                size="lg"
                onClick={handlePurchase}
                disabled={isBuying}
              >
                {isBuying ? "Processing..." : "Confirm Purchase"}
              </Button>

              {currentUser && currentUser.balance < product.price && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  Not enough balance. <Link href="/wallet" className="underline font-bold">Add funds here</Link>.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
