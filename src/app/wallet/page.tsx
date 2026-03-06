
"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { dbService } from "@/lib/db";
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
    return <div className="container p-20 text-center">Loading Wallet...</div>;
  }

  const userRequests = fundRequests.filter(r => r.userId === currentUser.id);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method || !proofImage) {
      toast({ title: "Error", description: "Fill all fields and upload proof.", variant: "destructive" });
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
      toast({ title: "Request Submitted", description: "Pending admin approval." });
      setAmount(''); setMethod(''); setProofImage(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
       {/* UI implementation remains similar but data comes from Firestore via AppProvider */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
             <Card className="glass-card border-white/5 bg-primary/10 neon-glow">
                <CardHeader>
                   <CardDescription>Total Balance</CardDescription>
                   <CardTitle className="text-4xl">Rs. {currentUser.balance.toLocaleString()}</CardTitle>
                </CardHeader>
             </Card>
             <Card className="glass-card border-white/5 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> Transfer Details</h3>
                <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-muted/50">
                      <p className="font-bold">Khalti / FonePay</p>
                      <p className="text-xl font-mono text-primary">9805602394</p>
                   </div>
                   <div className="p-4 rounded-xl bg-muted/50">
                      <p className="font-bold">eSewa</p>
                      <p className="text-xl font-mono text-primary">9811557054</p>
                   </div>
                </div>
             </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
             <Card className="glass-card border-white/5">
                <CardHeader><CardTitle>Add Funds Request</CardTitle></CardHeader>
                <CardContent>
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <Input type="number" placeholder="Amount (NPR)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                      <div className="flex gap-2">
                         {['eSewa', 'Khalti', 'FonePay'].map(m => (
                           <Button key={m} type="button" variant={method === m ? 'default' : 'outline'} className="flex-1" onClick={() => setMethod(m as any)}>{m}</Button>
                         ))}
                      </div>
                      <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer" onClick={() => document.getElementById('proof')?.click()}>
                         {proofImage ? <img src={proofImage} className="h-32 mx-auto" /> : "Upload Screenshot"}
                         <input id="proof" type="file" className="hidden" onChange={handleImageUpload} />
                      </div>
                      <Button className="w-full h-12 font-bold neon-glow" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Submit Request"}</Button>
                   </form>
                </CardContent>
             </Card>

             <Card className="glass-card border-white/5">
                <CardHeader><CardTitle>History</CardTitle></CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {userRequests.map(req => (
                        <div key={req.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                           <div>
                              <p className="font-bold">Rs. {req.amount}</p>
                              <p className="text-xs text-muted-foreground">{req.method}</p>
                           </div>
                           <Badge className={req.status === 'approved' ? 'bg-green-500' : req.status === 'rejected' ? 'bg-destructive' : 'bg-yellow-500'}>{req.status}</Badge>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  );
}
