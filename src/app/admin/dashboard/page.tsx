"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { dbService } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { 
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
  Lock,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const { currentUser, products, fundRequests, purchases, isLoading } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== 'admin')) {
      toast({ title: "Access Denied", description: "Admin accounts only.", variant: "destructive" });
      router.push('/');
    } else if (currentUser?.role === 'admin') {
      fetchAllUsers();
    }
  }, [currentUser, isLoading, router]);

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
        
        // 1. Update User Balance
        await dbService.updateUserBalance(request.userId, currentBalance + request.amount);
        
        // 2. DELETE the request (Admin requested removal after approval)
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
      // DELETE the request (Admin requested removal after rejection)
      await dbService.deleteFundRequest(reqId);
      toast({ title: "Request Rejected", description: "Payment record deleted." });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-headline uppercase tracking-widest text-xs">Authenticating Admin Session...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container py-40 flex justify-center items-center">
        <Card className="glass-card border-destructive/20 text-center p-12 space-y-4">
           <Lock className="h-12 w-12 text-destructive mx-auto mb-2" />
           <CardTitle>Unauthorized Access</CardTitle>
           <p className="text-muted-foreground">This area is restricted to administrators.</p>
           <Button onClick={() => router.push('/')}>Return Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold font-headline">Admin <span className="text-primary neon-text">Console</span></h1>
            <p className="text-muted-foreground mt-2">Oversee payments, products, and platform activity</p>
          </div>
          <Button variant="outline" className="border-white/10" onClick={() => router.push('/')}>Exit Dashboard</Button>
        </div>

        <Tabs defaultValue="funds" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-transparent mb-8">
            <TabsTrigger value="funds" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <Wallet className="h-4 w-4 mr-2" /> Funds
            </TabsTrigger>
            <TabsTrigger value="products" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <Package className="h-4 w-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <ShoppingBag className="h-4 w-4 mr-2" /> Sales
            </TabsTrigger>
            <TabsTrigger value="users" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <Users className="h-4 w-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="promos" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <Ticket className="h-4 w-4 mr-2" /> Promos
            </TabsTrigger>
            <TabsTrigger value="ann" className="bg-muted/30 border border-white/5 data-[state=active]:bg-primary h-12 rounded-xl transition-all">
              <Megaphone className="h-4 w-4 mr-2" /> News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funds" className="space-y-6">
            <Card className="glass-card border-white/5 overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-500" /> Pending Requests
                    </CardTitle>
                    <CardDescription>Handled requests are permanently deleted</CardDescription>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-none px-4 py-1">{fundRequests.length} Waiting</Badge>
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
                          <TableCell className="font-bold py-6">{req.username}</TableCell>
                          <TableCell className="text-primary font-bold">Rs. {req.amount.toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline" className="bg-muted/50 border-white/10">{req.method}</Badge></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="gap-2 h-9 border border-white/5 hover:bg-primary/20 transition-all" onClick={() => setViewingProof(req.proofImage)}>
                              <Maximize2 className="h-3.5 w-3.5" /> View Proof
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 h-9 px-4 gap-2 neon-glow-green" 
                                disabled={isProcessing === req.id}
                                onClick={() => handleApproveFund(req.id)}
                              >
                                {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-9 px-4 gap-2" 
                                disabled={isProcessing === req.id}
                                onClick={() => handleRejectFund(req.id)}
                              >
                                {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-24 text-center">
                    <Check className="h-16 w-16 mx-auto mb-4 text-green-500/20" />
                    <h3 className="text-xl font-bold">Inbox Empty</h3>
                    <p className="text-muted-foreground">No pending fund requests to process.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass-card border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Member List</CardTitle>
                <Badge variant="outline">{allUsers.length} Users</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="border-white/5"><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Balance</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {allUsers.map(u => (
                      <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-bold">{u.username}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-primary font-bold">Rs. {u.balance?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="rounded-md">
                            {u.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="glass-card border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Catalog</CardTitle>
                <Button size="sm" className="gap-2 neon-glow"><Plus className="h-4 w-4" /> New Product</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="border-white/5"><TableHead>Item Name</TableHead><TableHead>Price</TableHead><TableHead>Label</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-bold py-6">{p.name}</TableCell>
                        <TableCell className="text-primary">Rs. {p.price.toLocaleString()}</TableCell>
                        <TableCell>{p.tag ? <Badge variant="secondary" className="bg-primary/20 text-primary border-none">{p.tag}</Badge> : '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="hover:text-destructive transition-colors" onClick={() => dbService.deleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="glass-card border-white/5">
              <CardHeader><CardTitle>Global Sales Record</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="border-white/5"><TableHead>Buyer</TableHead><TableHead>Product</TableHead><TableHead>Paid</TableHead><TableHead>Timestamp</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {purchases.map(pur => (
                      <TableRow key={pur.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-bold">{pur.username}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                          {pur.productName}
                        </TableCell>
                        <TableCell className="text-primary font-bold">Rs. {pur.price.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{new Date(pur.createdAt).toLocaleString()}</TableCell>
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
        <DialogContent className="max-w-4xl glass-card border-white/10 p-0 overflow-hidden bg-black">
          <div className="relative group">
            <img src={viewingProof || ''} className="w-full h-auto max-h-[85vh] object-contain" />
            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/40 to-transparent flex justify-between items-end opacity-100 transition-opacity">
               <div className="space-y-1">
                 <h4 className="text-xl font-bold">Transaction Receipt</h4>
                 <p className="text-sm text-muted-foreground">Verify the details before approving funds</p>
               </div>
               <Button variant="secondary" className="rounded-xl h-12 px-8" onClick={() => setViewingProof(null)}>Done Reviewing</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}