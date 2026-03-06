
"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Eye,
  Ticket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Product, Announcement, User, PromoCode } from "@/lib/types";

export default function AdminDashboard() {
  const { currentUser, products, fundRequests, purchases, announcements, promoCodes, syncData } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

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
    }
  }, [currentUser]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // THE ADMIN PASSWORD IS: 090102030405
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
                <Input 
                  id="admin-pass" 
                  type="password" 
                  placeholder="Enter admin password" 
                  className="bg-muted/50" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full font-bold neon-glow">Unlock Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApproveFund = (reqId: string) => {
    const allRequests = db.getFundRequests();
    const reqIndex = allRequests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) return;

    const request = allRequests[reqIndex];
    const allUsers = db.getUsers();
    const userIndex = allUsers.findIndex(u => u.id === request.userId);

    if (userIndex !== -1) {
      allUsers[userIndex].balance += request.amount;
      db.saveUsers(allUsers);
      
      allRequests[reqIndex].status = 'approved';
      db.saveFundRequests(allRequests);
      
      syncData();
      toast({ title: "Request Approved", description: `Added Rs. ${request.amount} to ${request.username}'s wallet.` });
    }
  };

  const handleRejectFund = (reqId: string) => {
    const allRequests = db.getFundRequests();
    const reqIndex = allRequests.findIndex(r => r.id === reqId);
    if (reqIndex !== -1) {
      allRequests[reqIndex].status = 'rejected';
      db.saveFundRequests(allRequests);
      syncData();
      toast({ title: "Request Rejected", description: "The fund request has been denied." });
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Math.random().toString(36).substring(7),
      name: newProductName,
      price: parseFloat(newProductPrice),
      description: `Premium ${newProductName} service.`,
      imageUrl: newProductImg || `https://picsum.photos/seed/${Math.random()}/600/400`,
      tag: newProductTag as any || undefined,
      createdAt: Date.now()
    };

    const allProducts = db.getProducts();
    db.saveProducts([...allProducts, newProduct]);
    syncData();
    setNewProductName(''); setNewProductPrice(''); setNewProductImg(''); setNewProductTag('');
    toast({ title: "Product Added", description: "Item is now live in the store." });
  };

  const handleDeleteProduct = (id: string) => {
    const allProducts = db.getProducts();
    db.saveProducts(allProducts.filter(p => p.id !== id));
    syncData();
    toast({ title: "Product Deleted", description: "Item removed from store." });
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromo: PromoCode = {
      id: Math.random().toString(36).substring(7),
      code: newPromoCode.toUpperCase(),
      discountAmount: parseFloat(newPromoDiscount),
      usageLimit: newPromoLimit ? parseInt(newPromoLimit) : null,
      usedCount: 0,
      expiryDate: newPromoExpiry ? new Date(newPromoExpiry).getTime() : null,
      createdAt: Date.now()
    };

    const allPromos = db.getPromoCodes();
    db.savePromoCodes([...allPromos, newPromo]);
    syncData();
    setNewPromoCode(''); setNewPromoDiscount(''); setNewPromoLimit(''); setNewPromoExpiry('');
    toast({ title: "Promo Created", description: `Code ${newPromo.code} is now active.` });
  };

  const handleDeletePromo = (id: string) => {
    const all = db.getPromoCodes();
    db.savePromoCodes(all.filter(p => p.id !== id));
    syncData();
    toast({ title: "Promo Deleted", description: "Code has been removed." });
  };

  const handlePostAnn = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnnouncement: Announcement = {
      id: Math.random().toString(36).substring(7),
      content: newAnn,
      createdAt: Date.now()
    };
    const all = db.getAnnouncements();
    db.saveAnnouncements([newAnnouncement, ...all]);
    syncData();
    setNewAnn('');
    toast({ title: "Announcement Posted", description: "Updates shared with users." });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold font-headline">Admin <span className="text-primary">Console</span></h1>
          <Button variant="outline" className="border-white/10" onClick={() => router.push('/')}>Exit to Store</Button>
        </div>

        <Tabs defaultValue="funds" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-transparent mb-8">
            <TabsTrigger value="funds" className="bg-muted/50 data-[state=active]:bg-primary h-12 gap-2">
              <Wallet className="h-4 w-4" /> Funds
            </TabsTrigger>
            <TabsTrigger value="products" className="bg-muted/50 data-[state=active]:bg-primary h-12 gap-2">
              <Package className="h-4 w-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="promos" className="bg-muted/50 data-[state=active]:bg-primary h-12 gap-2">
              <Ticket className="h-4 w-4" /> Promos
            </TabsTrigger>
            <TabsTrigger value="orders" className="bg-muted/50 data-[state=active]:bg-primary h-12 gap-2">
              <ShoppingBag className="h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="bg-muted/50 data-[state=active]:bg-primary h-12 gap-2">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="ann" className="bg-muted/50 data-[state=active]:bg-primary h-12 gap-2">
              <Megaphone className="h-4 w-4" /> News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funds">
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Fund Requests Management</CardTitle>
                <CardDescription>Approve or reject user deposit requests after verifying proof.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5">
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Proof</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fundRequests.length > 0 ? (
                      fundRequests.sort((a,b) => b.createdAt - a.createdAt).map((req) => (
                        <TableRow key={req.id} className="border-white/5">
                          <TableCell className="font-bold">{req.username}</TableCell>
                          <TableCell className="text-primary font-bold">Rs. {req.amount}</TableCell>
                          <TableCell>{req.method}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.open(req.proofImage, '_blank')}>
                              <Eye className="h-4 w-4" /> View Image
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              req.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                              req.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                              'bg-yellow-500/20 text-yellow-500'
                            }>
                              {req.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {req.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="text-green-500 hover:bg-green-500/20" onClick={() => handleApproveFund(req.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/20" onClick={() => handleRejectFund(req.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No requests found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-8">
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required placeholder="Valorant Acc" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (NPR)</Label>
                    <Input type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} required placeholder="500" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL (Optional)</Label>
                    <Input value={newProductImg} onChange={(e) => setNewProductImg(e.target.value)} placeholder="https://..." className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tag (NEW/HOT)</Label>
                    <Input value={newProductTag} onChange={(e) => setNewProductTag(e.target.value)} placeholder="HOT" className="bg-muted/50" />
                  </div>
                  <Button type="submit" className="lg:col-span-4 neon-glow">
                    <Plus className="h-4 w-4 mr-2" /> Create Product
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Manage Catalog</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5">
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id} className="border-white/5">
                        <TableCell>
                          <div className="relative h-10 w-10 rounded overflow-hidden">
                            <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full" />
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{p.name}</TableCell>
                        <TableCell>Rs. {p.price}</TableCell>
                        <TableCell>{p.tag ? <Badge>{p.tag}</Badge> : '-'}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProduct(p.id)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promos" className="space-y-8">
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Generate Promo Code</CardTitle>
                <CardDescription>Create discounts for users with limits and expiry.</CardDescription>
              </CardHeader>
              <CardContent>
                 <form onSubmit={handleAddPromo} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} required placeholder="SAVE50" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (NPR)</Label>
                      <Input type="number" value={newPromoDiscount} onChange={(e) => setNewPromoDiscount(e.target.value)} required placeholder="50" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Usage Limit (Optional)</Label>
                      <Input type="number" value={newPromoLimit} onChange={(e) => setNewPromoLimit(e.target.value)} placeholder="Forever if empty" className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date (Optional)</Label>
                      <Input type="date" value={newPromoExpiry} onChange={(e) => setNewPromoExpiry(e.target.value)} className="bg-muted/50" />
                    </div>
                    <Button type="submit" className="lg:col-span-4 neon-glow">
                      <Plus className="h-4 w-4 mr-2" /> Activate Promo
                    </Button>
                 </form>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Active Promos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5">
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodes.map((pr) => (
                      <TableRow key={pr.id} className="border-white/5">
                        <TableCell className="font-bold text-primary">{pr.code}</TableCell>
                        <TableCell>Rs. {pr.discountAmount}</TableCell>
                        <TableCell>{pr.usedCount}</TableCell>
                        <TableCell>{pr.usageLimit || 'Unlimited'}</TableCell>
                        <TableCell>{pr.expiryDate ? new Date(pr.expiryDate).toLocaleDateString() : 'Forever'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePromo(pr.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {promoCodes.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No active promo codes</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
             <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>All Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5">
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.sort((a,b) => b.createdAt - a.createdAt).map((pur) => (
                      <TableRow key={pur.id} className="border-white/5">
                        <TableCell className="font-mono text-xs">#{pur.id}</TableCell>
                        <TableCell className="font-bold">{pur.username}</TableCell>
                        <TableCell>{pur.productName}</TableCell>
                        <TableCell className="text-primary font-bold">
                          Rs. {pur.price}
                          {pur.discountApplied && <span className="text-[10px] block text-green-500">-Rs.{pur.discountApplied} off</span>}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline">{pur.contactMethod}</Badge> {pur.contactId}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(pur.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
              </CardHeader>
              <CardContent>
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
                    {db.getUsers().map((u) => (
                      <TableRow key={u.id} className="border-white/5">
                        <TableCell className="font-bold">{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell className="text-primary font-bold">Rs. {u.balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
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

          <TabsContent value="ann">
             <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle>Broadcast Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handlePostAnn} className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Announcement</Label>
                    <Input value={newAnn} onChange={(e) => setNewAnn(e.target.value)} required placeholder="Flash Sale starts tonight at 8 PM!" className="bg-muted/50" />
                  </div>
                  <Button type="submit" className="neon-glow">Post Announcement</Button>
                </form>

                <div className="space-y-3">
                  <h3 className="font-bold">Recent News</h3>
                  {announcements.map((a) => (
                    <div key={a.id} className="p-4 rounded-xl bg-muted/30 border border-white/5 flex justify-between items-center">
                       <p>{a.content}</p>
                       <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
