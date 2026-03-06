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
  Copy,
  ChevronRight,
  TrendingUp
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
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl relative">
       <div className="scan-line" />
       
       <div className="flex flex-col gap-10">
          {/* Main Balance Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-10 rounded-[3rem] glass-card border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 blur-[100px] -mr-10 -mt-10" />
            <div className="space-y-3 relative z-10">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold uppercase tracking-widest px-4 py-1">Virtual Currency Account</Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-headline uppercase tracking-tighter">Digital <span className="text-primary neon-text">Vault</span></h1>
              <p className="text-muted-foreground text-sm max-w-md">Real-time fund management for high-tier gaming assets. Deposits are manually verified by our audit team.</p>
            </div>
            
            <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-black/40 border border-white/5 neon-glow group transition-transform hover:scale-[1.02]">
              <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center group-hover:neon-glow transition-all">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Available NPR</p>
                <p className="text-4xl md:text-5xl font-bold font-headline">Rs. {currentUser.balance.toLocaleString()}</p>
                <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold">
                   <TrendingUp className="h-3 w-3" />
                   SYNCED WITH MARKET
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* Payment Accounts */}
             <div className="lg:col-span-4 space-y-6">
                <Card className="glass-card border-white/5 overflow-hidden rounded-[2.5rem]">
                   <CardHeader className="bg-primary/5 pb-4 border-b border-white/5">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-primary" /> Destination Nodes
                      </CardTitle>
                      <CardDescription className="text-xs">Transfer funds to these identifiers first</CardDescription>
                   </CardHeader>
                   <CardContent className="p-8 space-y-6">
                      {[
                        { label: 'Primary Node (eSewa)', id: '9811557054', color: 'text-green-500' },
                        { label: 'Secondary Node (Khalti/FonePay)', id: '9805602394', color: 'text-primary' }
                      ].map((acc, i) => (
                        <div 
                          key={i}
                          className="group relative p-6 rounded-[1.5rem] bg-muted/20 border border-white/5 hover:border-primary/50 transition-all cursor-pointer overflow-hidden active:scale-95" 
                          onClick={() => copyToClipboard(acc.id)}
                        >
                           <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="h-4 w-4 text-primary" />
                           </div>
                           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{acc.label}</p>
                           <p className={cn("text-3xl font-mono font-bold tracking-tight", acc.color)}>{acc.id}</p>
                           <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-2">
                             <Zap className="h-3 w-3 text-primary" /> Click to copy ID
                           </p>
                        </div>
                      ))}

                      <div className="flex items-start gap-4 p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20">
                        <Info className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-xs text-white font-bold uppercase tracking-widest">Verification Notice</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Audit cycles take <span className="text-white font-bold">5-15 mins</span>. Ensure your screenshot includes the <span className="text-white font-bold italic">Transaction Date</span> and <span className="text-white font-bold italic">Amount</span>.
                          </p>
                        </div>
                      </div>
                   </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-3 text-center group hover:bg-primary/5 transition-all">
                    <ShieldCheck className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Certified Secure</span>
                  </div>
                  <div className="glass-card border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-3 text-center group hover:bg-green-500/5 transition-all">
                    <Zap className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fast Processing</span>
                  </div>
                </div>
             </div>

             {/* Request Form */}
             <div className="lg:col-span-8 space-y-8">
                <Card className="glass-card border-white/5 overflow-hidden rounded-[2.5rem]">
                   <CardHeader className="border-b border-white/5 bg-primary/5 p-8">
                      <CardTitle className="text-2xl font-headline uppercase tracking-tighter">Sync <span className="text-primary">Deposit</span></CardTitle>
                      <CardDescription>Upload proof of payment to finalize the synchronization</CardDescription>
                   </CardHeader>
                   <CardContent className="p-10">
                      <form onSubmit={handleSubmit} className="space-y-10">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                               <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                 <PlusCircle className="h-4 w-4 text-primary" /> Deposit Amount (NPR)
                               </Label>
                               <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline font-bold text-muted-foreground">Rs.</span>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    className="h-16 pl-12 bg-muted/40 border-white/10 text-3xl font-bold font-headline rounded-2xl focus:ring-primary/50 transition-all focus:bg-muted/60" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                    required 
                                  />
                               </div>
                            </div>
                            <div className="space-y-4">
                               <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                                 <CreditCard className="h-4 w-4 text-primary" /> Payment Network
                               </Label>
                               <div className="flex gap-3">
                                  {['eSewa', 'Khalti', 'FonePay'].map(m => (
                                    <Button 
                                      key={m} 
                                      type="button" 
                                      variant={method === m ? 'default' : 'outline'} 
                                      className={cn(
                                        "flex-1 h-16 transition-all duration-300 rounded-2xl font-bold text-[10px] uppercase tracking-widest",
                                        method === m ? "neon-glow bg-primary border-none scale-105" : "border-white/10 hover:bg-primary/10"
                                      )} 
                                      onClick={() => setMethod(m as any)}
                                    >
                                      {m}
                                    </Button>
                                  ))}
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <Label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                              <Upload className="h-4 w-4 text-primary" /> Verification Proof (Screenshot)
                            </Label>
                            <div 
                              className={cn(
                                "border-2 border-dashed rounded-[3rem] p-16 text-center cursor-pointer transition-all duration-500 group",
                                proofImage ? "border-primary/60 bg-primary/10" : "border-white/10 hover:border-primary/40 hover:bg-white/5"
                              )}
                              onClick={() => document.getElementById('proof')?.click()}
                            >
                               {proofImage ? (
                                 <div className="relative inline-block">
                                    <img src={proofImage} className="h-56 md:h-72 rounded-3xl shadow-[0_0_50px_rgba(var(--primary),0.3)] object-contain mx-auto transition-transform group-hover:scale-[1.02]" alt="Proof" />
                                    <div className="absolute -top-5 -right-5 h-12 w-12 rounded-full bg-primary flex items-center justify-center neon-glow animate-pulse">
                                      <CheckCircle2 className="h-7 w-7 text-white" />
                                    </div>
                                    <p className="mt-6 text-xs text-primary font-bold tracking-widest uppercase">Capture Successful - Data Ready</p>
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center gap-6">
                                    <div className="h-24 w-24 rounded-[2.5rem] bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                       <Upload className="h-12 w-12" />
                                    </div>
                                    <div className="space-y-2">
                                       <p className="font-bold text-xl uppercase tracking-tighter">Initialize Upload</p>
                                       <p className="text-xs text-muted-foreground">Attach transaction receipt (MAX 5MB)</p>
                                    </div>
                                 </div>
                               )}
                               <input id="proof" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                         </div>

                         <Button 
                           className="w-full h-20 text-xl font-bold rounded-3xl neon-glow uppercase tracking-[0.3em] transition-all hover:scale-[1.01] active:scale-[0.98] group" 
                           disabled={isSubmitting}
                         >
                           {isSubmitting ? (
                             <><Loader2 className="h-7 w-7 animate-spin mr-3" /> Encrypting...</>
                           ) : (
                             <>
                               Finalize Deposit
                               <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                             </>
                           )}
                         </Button>
                      </form>
                   </CardContent>
                </Card>

                {/* History */}
                <Card className="glass-card border-white/5 overflow-hidden rounded-[2.5rem]">
                   <CardHeader className="border-b border-white/5 p-8 flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 font-headline uppercase tracking-tighter">Sync <span className="text-primary">History</span></CardTitle>
                        <CardDescription>Past auditing results and balance updates</CardDescription>
                      </div>
                      <Badge variant="outline" className="border-white/10 text-[10px] px-4 py-1 font-mono uppercase">{userRequests.length} LOGS</Badge>
                   </CardHeader>
                   <CardContent className="p-0">
                      <div className="divide-y divide-white/5">
                         {userRequests.length > 0 ? (
                           userRequests.map(req => (
                             <div key={req.id} className="flex items-center justify-between p-8 hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-6">
                                   <div className={cn(
                                     "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110",
                                     req.method === 'eSewa' ? "bg-green-500/10 text-green-500" : 
                                     req.method === 'Khalti' ? "bg-purple-500/10 text-purple-500" : 
                                     "bg-blue-500/10 text-blue-500"
                                   )}>
                                      <Landmark className="h-8 w-8" />
                                   </div>
                                   <div className="space-y-1">
                                      <p className="font-bold text-2xl font-headline tracking-tight">Rs. {req.amount.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                                        {req.method} • {new Date(req.createdAt).toLocaleDateString()}
                                      </p>
                                   </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-3">
                                   <Badge className={cn(
                                     "px-5 py-2 rounded-2xl text-[10px] border-none font-black tracking-[0.2em] transition-all",
                                     req.status === 'approved' ? 'bg-green-500/20 text-green-500 neon-glow-green' : 
                                     req.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 
                                     'bg-yellow-500/20 text-yellow-500'
                                   )}>
                                     {req.status === 'pending' && <Clock className="h-3 w-3 mr-2 inline animate-pulse" />}
                                     {req.status.toUpperCase()}
                                   </Badge>
                                   <span className="text-[10px] text-muted-foreground font-mono opacity-50 uppercase tracking-widest">Hash: {req.id}</span>
                                </div>
                             </div>
                           ))
                         ) : (
                           <div className="py-32 text-center space-y-6">
                              <History className="h-20 w-20 text-muted-foreground mx-auto opacity-10 animate-pulse" />
                              <div className="space-y-1">
                                <p className="text-muted-foreground font-bold uppercase tracking-widest">No Active Logs</p>
                                <p className="text-xs text-muted-foreground/50">Your synchronization history is currently clear.</p>
                              </div>
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
