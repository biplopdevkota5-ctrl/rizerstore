
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
import { Textarea } from "@/components/ui/textarea";
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
  ChevronRight,
  Plus,
  Trash2,
  Ticket,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { User, Product, PromoCode } from "@/lib/types";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { currentUser, fundRequests, purchases, products, promoCodes, isLoading } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [securityKey, setSecurityKey] = useState("");
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Form States
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', imageUrl: '', tag: '' });
  const [newPromo, setNewPromo] = useState({ code: '', discountAmount: '', usageLimit: '' });

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
      toast({ title: "Invalid Key", description: "Unauthorized access attempt.", variant: "destructive" });
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    try {
      const productData: Product = {
        id: Math.random().toString(36).substring(7),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        imageUrl: newProduct.imageUrl || 'https://picsum.photos/seed/product/600/400',
        tag: newProduct.tag,
        createdAt: Date.now()
      };
      await dbService.addProduct(productData);
      setNewProduct({ name: '', price: '', description: '', imageUrl: '', tag: '' });
      toast({ title: "Product Added", description: "Item is now live in the store." });
    } catch (e) {
      toast({ title: "Failed to add product", variant: "destructive" });
    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.discountAmount) return;
    try {
      const promoData: PromoCode = {
        id: Math.random().toString(36).substring(7),
        code: newPromo.code.toUpperCase(),
        discountAmount: parseFloat(newPromo.discountAmount),
        usageLimit: newPromo.usageLimit ? parseInt(newPromo.usageLimit) : null,
        usedCount: 0,
        expiryDate: null,
        createdAt: Date.now()
      };
      await dbService.addPromoCode(promoData);
      setNewPromo({ code: '', discountAmount: '', usageLimit: '' });
      toast({ title: "Promo Created", description: `Code ${promoData.code} is active.` });
    } catch (e) {
      toast({ title: "Failed to create promo", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Remove this product?")) return;
    await dbService.deleteProduct(id);
    toast({ title: "Product Removed" });
  };

  const handleDeletePromo = async (id: string) => {
    await dbService.deletePromoCode(id);
    toast({ title: "Promo Deleted" });
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
            <p className="text-muted-foreground mt-2">Global infrastructure and operations management</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-10 px-4 gap-2 border-white/10 bg-black/40">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              SYSTEMS ONLINE
            </Badge>
            <Button variant="outline" className="border-white/10" onClick={() => setIsAuthorized(false)}>Lock Console</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Circulating Funds", value: `Rs. ${totalBalance.toLocaleString()}`, icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
            { label: "Active Members", value: allUsers.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Catalog Size", value: products.length, icon: Package, color: "text-yellow-500", bg: "bg-yellow-500/10" },
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

        <Tabs defaultValue="funds" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto gap-2 bg-transparent mb-8">
            <TabsTrigger value="funds" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl">
              <Wallet className="h-4 w-4 mr-2" /> Deposits
            </TabsTrigger>
            <TabsTrigger value="catalog" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl">
              <Package className="h-4 w-4 mr-2" /> Catalog
            </TabsTrigger>
            <TabsTrigger value="promos" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl">
              <Ticket className="h-4 w-4 mr-2" /> Promos
            </TabsTrigger>
            <TabsTrigger value="users" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl">
              <Users className="h-4 w-4 mr-2" /> Users
            </TabsTrigger>
          </TabsList>

          {/* Fund Requests Content */}
          <TabsContent value="funds" className="space-y-6">
            <Card className="glass-card border-white/5 overflow-hidden rounded-3xl">
              <CardHeader className="border-b border-white/5 bg-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" /> Pending Validations
                  </CardTitle>
                  <Badge className="bg-yellow-500/20 text-yellow-500 px-4 py-1">{fundRequests.length} WAITING</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {fundRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5">
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundRequests.map((req) => (
                        <TableRow key={req.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="font-bold py-6">{req.username}</TableCell>
                          <TableCell className="text-primary font-bold">Rs. {req.amount.toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline">{req.method}</Badge></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => setViewingProof(req.proofImage)}>
                              <Maximize2 className="h-3.5 w-3.5 mr-2" /> Inspect
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 h-9 px-6 rounded-xl" 
                                onClick={() => handleApproveFund(req.id)}
                                disabled={isProcessing === req.id}
                              >
                                {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-9 px-6 rounded-xl" 
                                onClick={() => handleRejectFund(req.id)}
                                disabled={isProcessing === req.id}
                              >
                                {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-24 text-center text-muted-foreground">No pending fund validations.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Catalog Content */}
          <TabsContent value="catalog" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="glass-card border-white/5 p-6 h-fit">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                     <Plus className="h-5 w-5 text-primary" /> New Product
                   </h3>
                   <form onSubmit={handleAddProduct} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Product Name</Label>
                        <Input 
                          placeholder="e.g. Valorant Stacked Acc" 
                          value={newProduct.name} 
                          onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (NPR)</Label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={newProduct.price} 
                          onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          placeholder="Features, rank, items..." 
                          value={newProduct.description} 
                          onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL (Optional)</Label>
                        <Input 
                          placeholder="https://..." 
                          value={newProduct.imageUrl} 
                          onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Badge Tag (Optional)</Label>
                        <Input 
                          placeholder="e.g. HOT, NEW, LIMITED" 
                          value={newProduct.tag} 
                          onChange={e => setNewProduct({...newProduct, tag: e.target.value})}
                        />
                      </div>
                      <Button className="w-full neon-glow font-bold mt-4" type="submit">Deploy Product</Button>
                   </form>
                </Card>

                <Card className="lg:col-span-2 glass-card border-white/5 p-0 overflow-hidden">
                   <Table>
                      <TableHeader>
                        <TableRow className="border-white/5">
                          <TableHead>Item</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Tag</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map(p => (
                          <TableRow key={p.id} className="border-white/5">
                            <TableCell className="font-bold">{p.name}</TableCell>
                            <TableCell>Rs. {p.price.toLocaleString()}</TableCell>
                            <TableCell>{p.tag && <Badge>{p.tag}</Badge>}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProduct(p.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                </Card>
             </div>
          </TabsContent>

          {/* Promos Content */}
          <TabsContent value="promos" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="glass-card border-white/5 p-6 h-fit">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                     <Plus className="h-5 w-5 text-primary" /> Create Promo
                   </h3>
                   <form onSubmit={handleAddPromo} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Promo Code</Label>
                        <Input 
                          placeholder="e.g. RIZER50" 
                          className="font-mono uppercase"
                          value={newPromo.code} 
                          onChange={e => setNewPromo({...newPromo, code: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Discount Amount (NPR)</Label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={newPromo.discountAmount} 
                          onChange={e => setNewPromo({...newPromo, discountAmount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Usage Limit (Blank for Unlimited)</Label>
                        <Input 
                          type="number" 
                          placeholder="Unrestricted" 
                          value={newPromo.usageLimit} 
                          onChange={e => setNewPromo({...newPromo, usageLimit: e.target.value})}
                        />
                      </div>
                      <Button className="w-full neon-glow font-bold mt-4" type="submit">Generate Code</Button>
                   </form>
                </Card>

                <Card className="lg:col-span-2 glass-card border-white/5 p-0 overflow-hidden">
                   <Table>
                      <TableHeader>
                        <TableRow className="border-white/5">
                          <TableHead>Code</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promoCodes.map(p => (
                          <TableRow key={p.id} className="border-white/5">
                            <TableCell className="font-mono font-bold text-primary">{p.code}</TableCell>
                            <TableCell>Rs. {p.discountAmount}</TableCell>
                            <TableCell>
                              {p.usedCount} / {p.usageLimit || '∞'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePromo(p.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                </Card>
             </div>
          </TabsContent>

          {/* Users Content */}
          <TabsContent value="users">
            <Card className="glass-card border-white/5 p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id} className="border-white/5">
                      <TableCell className="font-bold">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="font-bold text-primary">Rs. {user.balance.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'outline'}>{user.role}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!viewingProof} onOpenChange={(open) => !open && setViewingProof(null)}>
        <DialogContent className="max-w-4xl glass-card border-white/10 p-0 overflow-hidden bg-black rounded-[2rem]">
          <div className="relative group">
            <img src={viewingProof || ''} className="w-full h-auto max-h-[85vh] object-contain" />
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-end">
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
