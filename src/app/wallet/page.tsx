"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { dbService } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  PlusCircle, 
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
  Loader2,
  Copy
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
      <div className="container min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-headline uppercase tracking-widest text-xs animate-pulse">Syncing Digital Assets...</p>
      </div>
    );
  }

  const userRequests = fundRequests.filter(r => r.userId === currentUser.id);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Limit is 5MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${text} is on your clipboard.` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method || !proofImage) {
      toast({ title: "Details Missing", description: "Complete all fields to proceed.", variant: "destructive" });
      return;
    }

    if (parseFloat(amount) < 10) {
      toast({ title: "Invalid Amount", description: "Min deposit is Rs. 10.", variant: "destructive" });
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
      toast({ title: "Submission Successful", description: "Your deposit is now in the queue for approval." });
      setAmount(''); setMethod(''); setProofImage(null);
    } catch (error) {
      toast({ title: "Submission Failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
       <div className="flex flex-col gap-10">
          {/* Main Balance Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-[2rem] glass-card border-primary/20 bg-primary/5">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-bold font-headline">Digital <span className="text-primary neon-text">Wallet</span></h1>
              <p className="text-muted-foreground">Manage your virtual currency and payments</p>
            </div>
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-black/40 border border-white/5 neon-glow">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Total Balance</p>
                <p className="text-3xl font-bold font-headline">Rs. {currentUser.balance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Payment Accounts */}
             <div className="lg:col-span-4 space-y-6">
                <Card className="glass-card border-white/5 overflow-hidden rounded-[2rem]">
                   <CardHeader className="bg-primary/5 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-primary" /> Destination IDs
                      </CardTitle>
                      <CardDescription>Send funds to these accounts first</CardDescription>
                   </CardHeader>
                   <CardContent className="p-6 space-y-4">
                      {[
                        { label: 'Khalti / FonePay / ImePay', id: '9805602394' },
                        { label: 'eSewa ID', id: '9811557054' }
                      ].map((acc, i) => (
                        <div 
                          key={i}
                          className="group relative p-5 rounded-2xl bg-muted/30 border border-white/5 hover:border-primary/50 transition-all cursor-pointer overflow-hidden" 
                          onClick={() => copyToClipboard(acc.id)}
                        >
                           <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="h-4 w-4 text-primary" />
                           </div>
                           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{acc.label}</p>
                           <p className="text-2xl font-mono text-primary font-bold">{acc.id}</p>
                           <p className="text-[10px] text-muted-foreground mt-2 opacity-50">Click to copy ID</p>
                        </div>
                      ))}

                      <div className="flex items-start gap-3 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Verification is manual and usually takes <span className="text-white font-bold">5-15 minutes</span>. Ensure you upload a clear receipt.
                        </p>
                      </div>
                   </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card border-white/5 p-5 rounded-3xl flex flex-col items-center gap-2 text-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
                  </div>
                  <div className="glass-card border-white/5 p-5 rounded-3xl flex flex-col items-center gap-2 text-center">
                    <Zap className="h-6 w-6 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Instant</span>
                  </div>
                </div>
             </div>

             {/* Request Form */}
             <div className="lg:col-span-8 space-y-8">
                <Card className="glass-card border-white/5 overflow-hidden rounded-[2rem]">
                   <CardHeader className="border-b border-white/5 bg-primary/5">
                      <CardTitle>Deposit Portal</CardTitle>
                      <CardDescription>Upload proof of payment to credit your account</CardDescription>
                   </CardHeader>
                   <CardContent className="p-8">
                      <form onSubmit={handleSubmit} className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <Label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                 <PlusCircle className="h-4 w-4 text-primary" /> Amount (NPR)
                               </Label>
                               <Input 
                                 type="number" 
                                 placeholder="0.00" 
                                 className="h-14 bg-muted/40 border-white/10 text-xl font-bold font-headline rounded-2xl focus:ring-primary/50" 
                                 value={amount} 
                                 onChange={(e) => setAmount(e.target.value)} 
                                 required 
                               />
                            </div>
                            <div className="space-y-3">
                               <Label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                 <CreditCard className="h-4 w-4 text-primary" /> Network
                               </Label>
                               <div className="flex gap-2">
                                  {['eSewa', 'Khalti', 'FonePay'].map(m => (
                                    <Button 
                                      key={m} 
                                      type="button" 
                                      variant={method === m ? 'default' : 'outline'} 
                                      className={cn(
                                        "flex-1 h-14 transition-all duration-300 rounded-2xl font-bold text-xs uppercase",
                                        method === m ? "neon-glow bg-primary border-none" : "border-white/10 hover:bg-primary/10"
                                      )} 
                                      onClick={() => setMethod(m as any)}
                                    >
                                      {m}
                                    </Button>
                                  ))}
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <Label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                              <Upload className="h-4 w-4 text-primary" /> Proof of Payment
                            </Label>
                            <div 
                              className={cn(
                                "border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all duration-500",
                                proofImage ? "border-primary/60 bg-primary/10" : "border-white/10 hover:border-primary/40 hover:bg-white/5"
                              )}
                              onClick={() => document.getElementById('proof')?.click()}
                            >
                               {proofImage ? (
                                 <div className="relative inline-block group">
                                    <img src={proofImage} className="h-48 md:h-64 rounded-3xl shadow-2xl object-contain mx-auto transition-transform group-hover:scale-105" alt="Proof" />
                                    <div className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-primary flex items-center justify-center neon-glow">
                                      <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                    <p className="mt-4 text-xs text-primary font-bold">Screenshot Captured - Ready to Sync</p>
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center gap-5">
                                    <div className="h-20 w-20 rounded-[2rem] bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                       <Upload className="h-10 w-10" />
                                    </div>
                                    <div className="space-y-1">
                                       <p className="font-bold text-lg">Select Screenshot</p>
                                       <p className="text-xs text-muted-foreground">PNG or JPG up to 5MB</p>
                                    </div>
                                 </div>
                               )}
                               <input id="proof" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                         </div>

                         <Button 
                           className="w-full h-16 text-lg font-bold rounded-2xl neon-glow uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-[0.99]" 
                           disabled={isSubmitting}
                         >
                           {isSubmitting ? (
                             <><Loader2 className="h-6 w-6 animate-spin mr-3" /> Processing...</>
                           ) : (
                             "Initialize Verification"
                           )}
                         </Button>
                      </form>
                   </CardContent>
                </Card>

                {/* Local Sync History */}
                <Card className="glass-card border-white/5 overflow-hidden rounded-[2rem]">
                   <CardHeader className="border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5 text-primary" /> Recent Syncs
                        </CardTitle>
                        <Badge variant="outline" className="border-white/10 text-[10px] px-3">{userRequests.length} Total</Badge>
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <div className="divide-y divide-white/5">
                         {userRequests.length > 0 ? (
                           userRequests.map(req => (
                             <div key={req.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-5">
                                   <div className={cn(
                                     "h-14 w-14 rounded-2xl flex items-center justify-center",
                                     req.method === 'eSewa' ? "bg-green-500/10 text-green-500" : 
                                     req.method === 'Khalti' ? "bg-purple-500/10 text-purple-500" : 
                                     "bg-blue-500/10 text-blue-500"
                                   )}>
                                      <Landmark className="h-7 w-7" />
                                   </div>
                                   <div>
                                      <p className="font-bold text-xl">Rs. {req.amount.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">{req.method} • {new Date(req.createdAt).toLocaleDateString()}</p>
                                   </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                   <Badge className={cn(
                                     "px-4 py-1.5 rounded-xl text-[10px] border-none font-bold tracking-widest",
                                     req.status === 'approved' ? 'bg-green-500/20 text-green-500' : 
                                     req.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 
                                     'bg-yellow-500/20 text-yellow-500'
                                   )}>
                                     {req.status === 'pending' && <Clock className="h-3 w-3 mr-2 inline animate-pulse" />}
                                     {req.status.toUpperCase()}
                                   </Badge>
                                   <span className="text-[10px] text-muted-foreground font-mono opacity-50">TXID: #{req.id}</span>
                                </div>
                             </div>
                           ))
                         ) : (
                           <div className="py-24 text-center space-y-4">
                              <History className="h-16 w-16 text-muted-foreground mx-auto opacity-10" />
                              <p className="text-muted-foreground">Your transaction history is clear.</p>
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