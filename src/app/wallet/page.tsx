"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, PlusCircle, ArrowUpCircle, History, Landmark, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FundRequest } from "@/lib/types";

export default function WalletPage() {
  const { currentUser, fundRequests, syncData } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'eSewa' | 'Khalti' | 'FonePay' | ''>('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth?tab=login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  const userRequests = fundRequests.filter(r => r.userId === currentUser.id);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method || !proofImage) {
      toast({ title: "Error", description: "Please fill all fields and upload proof.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    const newRequest: FundRequest = {
      id: Math.random().toString(36).substring(7),
      userId: currentUser.id,
      username: currentUser.username,
      amount: parseFloat(amount),
      method: method as any,
      proofImage,
      status: 'pending',
      createdAt: Date.now()
    };

    const allRequests = db.getFundRequests();
    db.saveFundRequests([...allRequests, newRequest]);
    
    syncData();
    toast({ title: "Request Submitted", description: "Your fund request is pending admin approval." });
    
    setAmount('');
    setMethod('');
    setProofImage(null);
    setIsSubmitting(false);
  };

  const paymentMethods = [
    { name: 'eSewa', number: '9811557054', color: 'bg-[#60bb46]' },
    { name: 'Khalti', number: '9805602394', color: 'bg-[#5c2d91]' },
    { name: 'FonePay', number: '9805602394', color: 'bg-[#ed1c24]' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <Card className="glass-card border-white/5 bg-primary/10 neon-glow overflow-hidden relative">
             <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary blur-[60px] opacity-30" />
             <CardHeader>
               <CardDescription className="text-primary-foreground/70 uppercase tracking-widest text-xs font-bold">Total Balance</CardDescription>
               <CardTitle className="text-3xl md:text-4xl font-headline font-bold">Rs. {currentUser.balance.toLocaleString()}</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Wallet className="h-4 w-4" />
                   Available for instant checkout
                </div>
             </CardContent>
          </Card>

          <Card className="glass-card border-white/5 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Transfer Details
            </h3>
            <div className="space-y-4">
              {paymentMethods.map((pm) => (
                <div key={pm.name} className="flex flex-col p-4 rounded-xl bg-muted/50 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{pm.name}</span>
                    <Badge className={pm.color}>{pm.name}</Badge>
                  </div>
                  <span className="text-xl font-mono text-primary">{pm.number}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-primary" />
                Add Funds Request
              </CardTitle>
              <CardDescription>Upload payment proof after transferring money to the numbers shown.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (NPR)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="Minimum 100" 
                      className="bg-muted/50 border-white/5 h-12"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="flex gap-2">
                      {['eSewa', 'Khalti', 'FonePay'].map((m) => (
                        <Button
                          key={m}
                          type="button"
                          variant={method === m ? 'default' : 'outline'}
                          className={`flex-1 text-xs md:text-sm ${method === m ? 'neon-glow' : 'border-white/5'}`}
                          onClick={() => setMethod(m as any)}
                        >
                          {m}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Payment Proof Image</Label>
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 md:p-8 transition-colors cursor-pointer ${proofImage ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30'}`}
                    onClick={() => document.getElementById('proof-upload')?.click()}
                  >
                    {proofImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <img src={proofImage} alt="Proof" className="w-full h-full object-contain" />
                        <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-8 w-8" onClick={(e) => { e.stopPropagation(); setProofImage(null); }}>
                           <PlusCircle className="h-4 w-4 rotate-45" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Upload className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                        </div>
                        <p className="font-bold text-sm md:text-base">Click to upload screenshot</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">JPG, PNG or WEBP (Max 5MB)</p>
                      </>
                    )}
                    <input id="proof-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>

                <Button className="w-full h-12 md:h-14 text-base md:text-lg font-bold neon-glow" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Fund Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Fund Request History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRequests.length > 0 ? (
                  userRequests.sort((a,b) => b.createdAt - a.createdAt).map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-white/5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <ArrowUpCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-sm md:text-base">Rs. {req.amount.toLocaleString()}</p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()} • {req.method}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] md:text-xs ${
                        req.status === 'approved' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                        req.status === 'rejected' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                        'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                      }`}>
                        {req.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                     No fund requests yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
