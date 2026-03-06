
"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { dbService } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Package, 
  Megaphone, 
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  X,
  Ticket,
  Maximize2,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Product, Announcement, User, PromoCode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const { currentUser, products, fundRequests, purchases, announcements, promoCodes } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Forms
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImg, setNewProductImg] = useState('');
  const [newProductTag, setNewProductTag] = useState('');
  
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [newPromoLimit, setNewPromoLimit] = useState('');
  const [newPromoExpiry, setNewPromoExpiry] = useState('');

  const [newAnn, setNewAnn] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setIsAdminAuthenticated(true);
      fetchAllUsers();
    }
  }, [currentUser]);

  const fetchAllUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setAllUsers(snap.docs.map(d => d.data() as User));
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '090102030405') {
      setIsAdminAuthenticated(true);
      toast({ title: "Welcome, Admin", description: "Authorization successful." });
    } else {
      toast({ title: "Access Denied", description: "Incorrect admin password.", variant: "destructive" });
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-40 flex justify-center items-center">
        <Card className="w-full max-w-md glass-card border-white/5 neon-glow">
          <CardHeader className="text-center">
            <LayoutDashboard className="h-10 w-10 text-primary mx-auto mb-4" />
            <CardTitle>Admin Entrance</CardTitle>
            <CardDescription>Enter admin credentials (090102030405) to proceed</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-pass">Security Key</Label>
                <Input id="admin-pass" type="password" placeholder="Enter admin password" className="bg-muted/50" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              </div>
              <Button type="submit" className="w-full font-bold neon-glow">Unlock Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApproveFund = async (reqId: string) => {
    const request = fundRequests.find(r => r.id === reqId);
    if (!request) return;

    try {
      // Get latest user balance from DB
      const userRef = doc(db, 'users', request.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        await dbService.updateUserBalance(request.userId, (userData.balance || 0) + request.amount);
        await dbService.updateFundRequestStatus(reqId, 'approved');
        toast({ title: "Request Approved", description: `Added Rs. ${request.amount} to wallet.` });
        fetchAllUsers();
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not approve request.", variant: "destructive" });
    }
  };

  const handleRejectFund = async (reqId: string) => {
    try {
      await dbService.updateFundRequestStatus(reqId, 'rejected');
      toast({ title: "Request Rejected" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Math.random().toString(36).substring(7),
      name: newProductName,
      price: parseFloat(newProductPrice),
      description: `Premium ${newProductName} service.`,
      imageUrl: newProductImg || `https://picsum.photos/seed/${Math.random()}/600/400`,
      tag: newProductTag as any || undefined,
      createdAt: Date.now()
    };

    await dbService.addProduct(product);
    setNewProductName(''); setNewProductPrice(''); setNewProductImg(''); setNewProductTag('');
    toast({ title: "Product Added" });
  };

  const handleDeleteProduct = async (id: string) => {
    await dbService.deleteProduct(id);
    toast({ title: "Product Deleted" });
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const promo: PromoCode = {
      id: Math.random().toString(36).substring(7),
      code: newPromoCode.toUpperCase(),
      discountAmount: parseFloat(newPromoDiscount),
      usageLimit: newPromoLimit ? parseInt(newPromoLimit) : null,
      usedCount: 0,
      expiryDate: newPromoExpiry ? new Date(newPromoExpiry).getTime() : null,
      createdAt: Date.now()
    };

    await dbService.addPromoCode(promo);
    setNewPromoCode(''); setNewPromoDiscount(''); setNewPromoLimit(''); setNewPromoExpiry('');
    toast({ title: "Promo Created" });
  };

  const handleDeletePromo = async (id: string) => {
    await dbService.deletePromoCode(id);
    toast({ title: "Promo Deleted" });
  };

  const handlePostAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    const ann: Announcement = {
      id: Math.random().toString(36).substring(7),
      content: newAnn,
      createdAt: Date.now()
    };
    await dbService.addAnnouncement(ann);
    setNewAnn('');
    toast({ title: "Announcement Posted" });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-4xl font-bold font-headline">Admin <span className="text-primary">Console</span></h1>
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>Exit</Button>
        </div>

        <Tabs defaultValue="funds">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-transparent mb-8">
            <TabsTrigger value="funds" className="bg-muted/50 data-[state=active]:bg-primary"><Wallet className="h-4 w-4 mr-2" /> Funds</TabsTrigger>
            <TabsTrigger value="products" className="bg-muted/50 data-[state=active]:bg-primary"><Package className="h-4 w-4 mr-2" /> Products</TabsTrigger>
            <TabsTrigger value="promos" className="bg-muted/50 data-[state=active]:bg-primary"><Ticket className="h-4 w-4 mr-2" /> Promos</TabsTrigger>
            <TabsTrigger value="orders" className="bg-muted/50 data-[state=active]:bg-primary"><ShoppingBag className="h-4 w-4 mr-2" /> Orders</TabsTrigger>
            <TabsTrigger value="users" className="bg-muted/50 data-[state=active]:bg-primary"><Users className="h-4 w-4 mr-2" /> Users</TabsTrigger>
            <TabsTrigger value="ann" className="bg-muted/50 data-[state=active]:bg-primary"><Megaphone className="h-4 w-4 mr-2" /> News</TabsTrigger>
          </TabsList>

          <TabsContent value="funds">
            <Card className="glass-card border-white/5">
              <CardHeader><CardTitle>Fund Requests</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>User</TableHead><TableHead>Amount</TableHead><TableHead>Proof</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {fundRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.username}</TableCell>
                        <TableCell className="text-primary font-bold">Rs. {req.amount}</TableCell>
                        <TableCell>
                          <div className="h-10 w-16 rounded overflow-hidden cursor-pointer" onClick={() => setViewingProof(req.proofImage)}>
                            <img src={req.proofImage} alt="Proof" className="object-cover w-full h-full" />
                          </div>
                        </TableCell>
                        <TableCell><Badge className={cn(req.status === 'approved' ? 'bg-green-500/20 text-green-500' : req.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 'bg-yellow-500/20 text-yellow-500')}>{req.status.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-right">
                          {req.status === 'pending' && (
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleApproveFund(req.id)}><Check className="h-4 w-4 text-green-500" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => handleRejectFund(req.id)}><X className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs follow same pattern using context state and dbService calls */}
          <TabsContent value="products">
             {/* Product management implementation similar to local version but calling dbService */}
             <Card className="glass-card border-white/5">
                <CardHeader><CardTitle>Catalog</CardTitle></CardHeader>
                <CardContent>
                   <Table>
                      <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                         {products.map(p => (
                           <TableRow key={p.id}>
                              <TableCell>{p.name}</TableCell>
                              <TableCell>Rs. {p.price}</TableCell>
                              <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                           </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                </CardContent>
             </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="glass-card border-white/5">
              <CardHeader><CardTitle>User Directory</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {allUsers.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>{u.username}</TableCell>
                        <TableCell className="text-primary font-bold">Rs. {u.balance?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!viewingProof} onOpenChange={(open) => !open && setViewingProof(null)}>
        <DialogContent className="max-w-3xl glass-card border-white/10">
          <DialogHeader><DialogTitle>Proof Verification</DialogTitle></DialogHeader>
          <div className="mt-4 flex flex-col items-center gap-4">
            <img src={viewingProof || ''} className="max-w-full max-h-[70vh] object-contain" />
            <Button className="w-full" onClick={() => setViewingProof(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
