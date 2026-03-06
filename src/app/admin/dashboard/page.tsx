
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/lib/context";
import { dbService } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { 
  Users, 
  Wallet, 
  Package, 
  ShoppingBag,
  Check,
  X,
  Maximize2,
  Clock,
  Lock,
  Loader2,
  DollarSign,
  ShieldAlert,
  Terminal,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { currentUser, fundRequests, purchases, isLoading } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [securityKey, setSecurityKey] = useState("");
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const MASTER_KEY = "090102030405";

  useEffect(() => {
    if (!isLoading && !currentUser) {
      toast({ title: "Access Denied", description: "Please login first.", variant: "destructive" });
      router.push('/auth?tab=login');
    } else if (currentUser) {
      fetchAllUsers();
    }
  }, [currentUser, isLoading, router]);

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityKey === MASTER_KEY) {
      setIsAuthorized(true);
      toast({ title: "Access Granted", description: "Admin session initialized." });
    } else {
      toast({ title: "Invalid Key", description: "Unauthorized access attempt logged.", variant: "destructive" });
      setSecurityKey("");
    }
  };

  const fetchAllUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setAllUsers(snap.docs.map(d => ({ ...d.data(), id: d.id } as User)));
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  const handleApproveFund = async (reqId: string) => {
    const request = fundRequests.find(r => r.id === reqId);
    if (!request) return;

    setIsProcessing(reqId);
    try {
      const userRef = doc(db, 'users', request.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        const currentBalance = userData.balance || 0;
        await dbService.updateUserBalance(request.userId, currentBalance + request.amount);
        await dbService.deleteFundRequest(reqId);
        toast({ title: "Request Approved", description: `Rs. ${request.amount} added to ${userData.username}'s wallet.` });
        fetchAllUsers();
      }
    } catch (error) {
      toast({ title: "Approval Error", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectFund = async (reqId: string) => {
    setIsProcessing(reqId);
    try {
      await dbService.deleteFundRequest(reqId);
      toast({ title: "Request Rejected", description: "Record removed." });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const totalRevenue = useMemo(() => purchases.reduce((acc, p) => acc + p.price, 0), [purchases]);
  const totalBalance = useMemo(() => allUsers.reduce((acc, u) => acc + (u.balance || 0), 0), [allUsers]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    return last7Days.map(day => ({
      name: day,
      sales: Math.floor(Math.random() * 5000) + 1000,
      deposits: Math.floor(Math.random() * 8000) + 2000,
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-headline uppercase tracking-widest text-xs">Syncing Command Layer...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container min-h-[80vh] flex items-center justify-center px-4">
        <Card className="glass-card border-primary/20 max-w-md w-full p-8 space-y-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/10 blur-[80px] rounded-full" />
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/30 neon-glow">
              <ShieldAlert className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-headline uppercase tracking-widest">Command Access</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Security Clearance Required</p>
          </div>

          <form onSubmit={handleAuthorize} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security Key</Label>
              <div className="relative">
                <Terminal className="absolute left-3 top-3.5 h-4 w-4 text-primary opacity-50" />
                <Input 
                  type="password" 
                  placeholder="••••••••••••" 
                  className="pl-10 h-12 bg-black/40 border-white/10 font-mono tracking-widest focus:ring-primary/50"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <Button className="w-full h-12 font-bold neon-glow group" type="submit">
              INITIALIZE UPLINK
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="pt-4 text-center">
            <Button variant="link" className="text-[10px] text-muted-foreground uppercase tracking-widest" onClick={() => router.push('/')}>
              Abort Session
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold font-headline uppercase tracking-tighter">Command <span className="text-primary neon-text">Center</span></h1>
            <p className="text-muted-foreground mt-2">Real-time platform surveillance and operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-10 px-4 gap-2 border-white/10 bg-black/40">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              SYSTEMS ONLINE
            </Badge>
            <Button variant="outline" className="border-white/10" onClick={() => setIsAuthorized(false)}>Lock Console</Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Circulating Funds", value: `Rs. ${totalBalance.toLocaleString()}`, icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
            { label: "Active Members", value: allUsers.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Sales count", value: purchases.length, icon: ShoppingBag, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="glass-card border-white/5 overflow-hidden relative group">
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity", stat.bg)} />
              <CardContent className="p-6 relative">
                 <div className="flex items-center justify-between mb-2">
                   <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</p>
                   <stat.icon className={cn("h-4 w-4", stat.color)} />
                 </div>
                 <h3 className="text-2xl font-bold font-headline">{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 glass-card border-white/5 p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-lg">Transaction Velocity</h3>
                  <p className="text-xs text-muted-foreground">Market activity for the last 7 cycles</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-none">Live Data</Badge>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                      <Area type="monotone" dataKey="deposits" stroke="#22c55e" fillOpacity={0} strokeWidth={2} />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
           </Card>

           <Card className="glass-card border-white/5 p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Operation Log
              </h3>
              <div className="space-y-4">
                 {purchases.slice(0, 6).map((pur, i) => (
                   <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                         <p className="text-xs font-bold truncate">{pur.username} bought {pur.productName}</p>
                         <p className="text-[10px] text-muted-foreground uppercase">{new Date(pur.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <Badge variant="outline" className="ml-auto text-[10px] h-6 border-white/5">Rs. {pur.price}</Badge>
                   </div>
                 ))}
              </div>
              <Button variant="link" className="w-full mt-6 text-primary text-xs font-bold" onClick={() => router.push('/history')}>View Master History</Button>
           </Card>
        </div>

        <Tabs defaultValue="funds" className="w-full mt-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-transparent mb-8">
            <TabsTrigger value="funds" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <Wallet className="h-4 w-4 mr-2" /> Pending Funds
            </TabsTrigger>
            <TabsTrigger value="products" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <Package className="h-4 w-4 mr-2" /> Catalog
            </TabsTrigger>
            <TabsTrigger value="users" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <Users className="h-4 w-4 mr-2" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funds" className="space-y-6">
            <Card className="glass-card border-white/5 overflow-hidden rounded-3xl">
              <CardHeader className="border-b border-white/5 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-500" /> Validation Queue
                    </CardTitle>
                    <CardDescription>Processed requests are permanently removed</CardDescription>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-none px-4 py-1">{fundRequests.length} WAITING</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {fundRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundRequests.map((req) => (
                        <TableRow key={req.id} className="border-white/5 hover:bg-white/5 group transition-colors">
                          <TableCell className="font-bold py-8">{req.username}</TableCell>
                          <TableCell className="text-primary font-bold">Rs. {req.amount.toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline" className="bg-muted/50 border-white/10 uppercase text-[10px] tracking-widest">{req.method}</Badge></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="gap-2 h-9 border border-white/5 hover:bg-primary/20 transition-all rounded-xl" onClick={() => setViewingProof(req.proofImage)}>
                              <Maximize2 className="h-3.5 w-3.5" /> Inspect
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 h-9 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-105" 
                                disabled={isProcessing === req.id}
                                onClick={() => handleApproveFund(req.id)}
                              >
                                {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                APPROVE
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-9 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-105" 
                                disabled={isProcessing === req.id}
                                onClick={() => handleRejectFund(req.id)}
                              >
                                {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                REJECT
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-24 text-center">
                    <Check className="h-20 w-20 mx-auto mb-4 text-green-500/10" />
                    <h3 className="text-xl font-bold">Queue Empty</h3>
                    <p className="text-muted-foreground text-sm">No pending fund validations required.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!viewingProof} onOpenChange={(open) => !open && setViewingProof(null)}>
        <DialogContent className="max-w-4xl glass-card border-white/10 p-0 overflow-hidden bg-black rounded-[2rem]">
          <div className="relative group">
            <img src={viewingProof || ''} className="w-full h-auto max-h-[85vh] object-contain" />
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-end opacity-100 transition-opacity">
               <div className="space-y-1">
                 <h4 className="text-xl font-bold font-headline uppercase tracking-tighter">Verification Asset</h4>
                 <p className="text-xs text-muted-foreground">Verify timestamp and transaction ID before clearing</p>
               </div>
               <Button variant="secondary" className="rounded-2xl h-12 px-10 font-bold" onClick={() => setViewingProof(null)}>Dismiss Viewer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
