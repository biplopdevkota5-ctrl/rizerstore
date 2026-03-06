
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
  Clock,
  History as HistoryIcon,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Product, Announcement, User, PromoCode, FundRequest } from "@/lib/types";
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

  // Split requests
  const pendingRequests = fundRequests.filter(r => r.status === 'pending');
  const processedRequests = fundRequests.filter(r => r.status !== 'pending');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setIsAdminAuthenticated(true);
      fetchAllUsers();
    }
  }, [currentUser]);

  const fetchAllUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setAllUsers(snap.docs.map(d => ({ ...d.data(), id: d.id } as User)));
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
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

          <TabsContent value="funds" className="space-y-8">
            <Card className="glass-card border-white/5">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                <div>
                  <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-yellow-500" /> Pending Requests</CardTitle>
                  <CardDescription>Requests waiting for your verification</CardDescription>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-500">{pendingRequests.length} Waiting</Badge>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {pendingRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5"><TableHead>User</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Proof</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((req) => (
                        <TableRow key={req.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="font-bold">{req.username}</TableCell>
                          <TableCell className="text-primary font-bold">Rs. {req.amount.toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline" className="border-white/10">{req.method}</Badge></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={() => setViewingProof(req.proofImage)}>
                              <Maximize2 className="h-3 w-3" /> View
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 gap-1" onClick={() => handleApproveFund(req.id)}><Check className="h-3 w-3" /> Approve</Button>
                              <Button size="sm" variant="destructive" className="h-8 gap-1" onClick={() => handleRejectFund(req.id)}><X className="h-3 w-3" /> Reject</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <Check className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>All clear! No pending requests.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                <div>
                  <CardTitle className="flex items-center gap-2 text-muted-foreground"><HistoryIcon className="h-5 w-5" /> Processing History</CardTitle>
                  <CardDescription>Previously handled deposit requests</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5"><TableHead>User</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedRequests.slice(0, 10).map((req) => (
                      <TableRow key={req.id} className="border-white/5 opacity-60">
                        <TableCell>{req.username}</TableCell>
                        <TableCell>Rs. {req.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={cn(req.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive')}>
                            {req.status.toUpperCase()}
                          </Badge>
                        </TableCell>
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
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="border-white/5"><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Balance</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {allUsers.map(u => (
                      <TableRow key={u.id} className="border-white/5">
                        <TableCell className="font-bold">{u.username}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-primary font-bold">Rs. {u.balance?.toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{u.role.toUpperCase()}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs remain similar but with improved table styling */}
          <TabsContent value="products">
            <Card className="glass-card border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Catalog</CardTitle>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add New</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="border-white/5"><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead>Tag</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id} className="border-white/5">
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell>Rs. {p.price.toLocaleString()}</TableCell>
                        <TableCell>{p.tag ? <Badge variant="secondary">{p.tag}</Badge> : '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => dbService.deleteProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
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
        <DialogContent className="max-w-3xl glass-card border-white/10 p-0 overflow-hidden">
          <div className="relative">
            <img src={viewingProof || ''} className="w-full h-auto max-h-[85vh] object-contain" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
               <p className="text-sm font-bold text-white">Payment Proof Verification</p>
               <Button variant="secondary" size="sm" onClick={() => setViewingProof(null)}>Close Viewer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
