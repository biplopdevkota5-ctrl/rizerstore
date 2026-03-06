
"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { dbService } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  PlusCircle, 
  ArrowUpCircle, 
  History, 
  Landmark, 
  Upload, 
  CreditCard,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FundRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const { currentUser, fundRequests, isLoading } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'eSewa' | 'Khalti' | 'FonePay' | ''>('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/auth?tab=login');
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Clock className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading Digital Wallet...</p>
      </div>
    );
  }

  const userRequests = fundRequests.filter(r => r.userId === currentUser.id);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Image must be under 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method || !proofImage) {
      toast({ title: "Incomplete Details", description: "Please provide amount, method, and proof of payment.", variant: "destructive" });
      return;
    }

    if (parseFloat(amount) < 10) {
      toast({ title: "Invalid Amount", description: "Minimum deposit is Rs. 10.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
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

      await dbService.addFundRequest(newRequest);
      toast({ title: "Request Submitted", description: "Your deposit is pending admin approval." });
      setAmount(''); setMethod(''); setProofImage(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
       <div className="flex flex-col gap-8">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold font-headline">Digital <span className="text-primary">Wallet</span></h1>
              <p className="text-muted-foreground mt-2">Manage your funds and deposit history</p>
            </div>
            <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl neon-glow">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Available Balance</p>
                <p className="text-2xl font-bold">Rs. {currentUser.balance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Left Column: Deposit Methods */}
             <div className="lg:col-span-4 space-y-6">
                <Card className="glass-card border-white/5 overflow-hidden">
                   <CardHeader className="bg-primary/5">
                      <CardTitle className="text-lg flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> Payment Accounts</CardTitle>
                      <CardDescription>Send funds to these IDs first</CardDescription>
                   </CardHeader>
                   <CardContent className="p-6 space-y-4">
                      <div className="group relative p-4 rounded-2xl bg-muted/30 border border-white/5 hover:border-primary/30 transition-all cursor-pointer overflow-hidden" onClick={() => { navigator.clipboard.writeText('9805602394'); toast({ title: "Copied!" }) }}>
                         <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap className="h-4 w-4 text-primary animate-pulse" />
                         </div>
                         <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Khalti / FonePay / ImePay</p>
                         <p className="text-2xl font-mono text-primary font-bold">9805602394</p>
                         <p className="text-[10px] text-muted-foreground mt-1">Tap to copy number</p>
                      </div>
                      
                      <div className="group relative p-4 rounded-2xl bg-muted/30 border border-white/5 hover:border-primary/30 transition-all cursor-pointer overflow-hidden" onClick={() => { navigator.clipboard.writeText('9811557054'); toast({ title: "Copied!" }) }}>
                         <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap className="h-4 w-4 text-primary animate-pulse" />
                         </div>
                         <p className="text-xs text-muted-foreground uppercase font-bold mb-1">eSewa ID</p>
                         <p className="text-2xl font-mono text-primary font-bold">9811557054</p>
                         <p className="text-[10px] text-muted-foreground mt-1">Tap to copy number</p>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Please ensure you send the exact amount. Verification usually takes 5-15 minutes.
                        </p>
                      </div>
                   </CardContent>
                </Card>

                <Card className="glass-card border-white/5 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-bold text-sm">Secure Verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-bold text-sm">Fast Approval</span>
                  </div>
                </Card>
             </div>

             {/* Right Column: Request Form & History */}
             <div className="lg:col-span-8 space-y-8">
                <Card className="glass-card border-white/5 overflow-hidden">
                   <CardHeader className="border-b border-white/5">
                      <CardTitle>Deposit Request</CardTitle>
                      <CardDescription>Upload proof of payment after sending funds</CardDescription>
                   </CardHeader>
                   <CardContent className="p-6 md:p-8">
                      <form onSubmit={handleSubmit} className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <Label className="text-sm font-bold flex items-center gap-2"><PlusCircle className="h-4 w-4 text-primary" /> Deposit Amount</Label>
                               <Input 
                                 type="number" 
                                 placeholder="Enter Amount (Rs.)" 
                                 className="h-12 bg-muted/30 border-white/10 text-lg font-bold" 
                                 value={amount} 
                                 onChange={(e) => setAmount(e.target.value)} 
                                 required 
                               />
                            </div>
                            <div className="space-y-3">
                               <Label className="text-sm font-bold flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Payment Method</Label>
                               <div className="flex gap-2">
                                  {['eSewa', 'Khalti', 'FonePay'].map(m => (
                                    <Button 
                                      key={m} 
                                      type="button" 
                                      variant={method === m ? 'default' : 'outline'} 
                                      className={cn(
                                        "flex-1 h-12 transition-all duration-300",
                                        method === m ? "neon-glow bg-primary" : "border-white/10 hover:bg-white/5"
                                      )} 
                                      onClick={() => setMethod(m as any)}
                                    >
                                      {m}
                                    </Button>
                                  ))}
                               </div>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <Label className="text-sm font-bold flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> Payment Proof Screenshot</Label>
                            <div 
                              className={cn(
                                "border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300",
                                proofImage ? "border-primary/50 bg-primary/5" : "border-white/10 hover:border-primary/30 hover:bg-white/5"
                              )}
                              onClick={() => document.getElementById('proof')?.click()}
                            >
                               {proofImage ? (
                                 <div className="relative inline-block">
                                    <img src={proofImage} className="h-40 md:h-52 rounded-2xl shadow-2xl object-contain mx-auto" alt="Proof" />
                                    <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary flex items-center justify-center neon-glow">
                                      <CheckCircle2 className="h-5 w-5 text-white" />
                                    </div>
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center gap-4 py-8">
                                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                                       <Upload className="h-8 w-8" />
                                    </div>
                                    <div>
                                       <p className="font-bold">Upload Screenshot</p>
                                       <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG up to 5MB</p>
                                    </div>
                                 </div>
                               )}
                               <input id="proof" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                         </div>

                         <Button className="w-full h-14 text-lg font-bold neon-glow rounded-2xl" disabled={isSubmitting}>
                           {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Submitting Request...</> : "Verify Deposit"}
                         </Button>
                      </form>
                   </CardContent>
                </Card>

                {/* Deposit History */}
                <Card className="glass-card border-white/5 overflow-hidden">
                   <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Request History</CardTitle>
                        <CardDescription>Review your recent deposits</CardDescription>
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <div className="divide-y divide-white/5">
                         {userRequests.length > 0 ? (
                           userRequests.sort((a,b) => b.createdAt - a.createdAt).map(req => (
                             <div key={req.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                   <div className={cn(
                                     "h-12 w-12 rounded-xl flex items-center justify-center",
                                     req.method === 'eSewa' ? "bg-green-500/10 text-green-500" : 
                                     req.method === 'Khalti' ? "bg-purple-500/10 text-purple-500" : 
                                     "bg-blue-500/10 text-blue-500"
                                   )}>
                                      <Landmark className="h-6 w-6" />
                                   </div>
                                   <div>
                                      <p className="font-bold text-lg">Rs. {req.amount.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{req.method} • {new Date(req.createdAt).toLocaleDateString()}</p>
                                   </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                   <Badge className={cn(
                                     "px-3 py-1 rounded-full text-[10px] border-none",
                                     req.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                                     req.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 
                                     'bg-yellow-500/20 text-yellow-500 animate-pulse'
                                   )}>
                                     {req.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                                     {req.status === 'rejected' && <XCircle className="h-3 w-3 mr-1 inline" />}
                                     {req.status === 'pending' && <Clock className="h-3 w-3 mr-1 inline" />}
                                     {req.status.toUpperCase()}
                                   </Badge>
                                   <span className="text-[10px] text-muted-foreground font-mono">#{req.id}</span>
                                </div>
                             </div>
                           ))
                         ) : (
                           <div className="p-16 text-center space-y-4">
                              <History className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                              <p className="text-muted-foreground">No deposit history found</p>
                           </div>
                         )}
                      </div>
                   </CardContent>
                </Card>
             </div>
          </div>
       </div>
    </div>
  );
}
