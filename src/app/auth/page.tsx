
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import { dbService } from "@/lib/db";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Lock, Mail, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCurrentUser } = useAppContext();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (email === 'admin@rizer.store' && password === '090102030405') {
        const adminUser = { id: 'admin-id', username: 'Admin', email: 'admin@rizer.store', balance: 999999, role: 'admin' as const };
        setCurrentUser(adminUser);
        toast({ title: "Admin Login Successful", description: "Welcome to the control panel." });
        router.push('/admin/dashboard');
        setIsLoading(false);
        return;
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email), where("password", "==", password));
      const qAlt = query(usersRef, where("username", "==", email), where("password", "==", password));
      
      let snap = await getDocs(q);
      if (snap.empty) snap = await getDocs(qAlt);

      if (!snap.empty) {
        const user = snap.docs[0].data() as any;
        setCurrentUser(user);
        toast({ title: "Welcome back!", description: `Logged in as ${user.username}` });
        router.push('/');
      } else {
        toast({ title: "Login Failed", description: "Invalid credentials.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const usersRef = collection(db, "users");
      const qUser = query(usersRef, where("username", "==", username));
      const qEmail = query(usersRef, where("email", "==", email));
      
      const [uSnap, eSnap] = await Promise.all([getDocs(qUser), getDocs(qEmail)]);

      if (!uSnap.empty) {
        toast({ title: "Signup Failed", description: "Username taken.", variant: "destructive" });
        return;
      }
      if (!eSnap.empty) {
        toast({ title: "Signup Failed", description: "Email registered.", variant: "destructive" });
        return;
      }

      const newUser = {
        id: Math.random().toString(36).substring(7),
        username,
        email,
        password,
        balance: 0,
        role: 'user' as const
      };

      await dbService.saveUser(newUser);
      setCurrentUser(newUser);

      toast({ title: "Account Created!", description: "Welcome to Rizer Store." });
      router.push('/');
    } catch (error) {
      toast({ title: "Error", description: "Could not create account.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center">
      <Card className="w-full max-w-md glass-card border-white/5 neon-glow">
        <CardHeader className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary mx-auto mb-4 neon-glow">
            <Gamepad2 className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Rizer Account</CardTitle>
          <CardDescription>Enter the gaming world with Rizer Store</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email or Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="login-email" placeholder="Enter your email" className="pl-10 bg-muted/30" type="text" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="••••••••" className="pl-10 bg-muted/30" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full font-bold h-11 neon-glow" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login to Store"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="username" placeholder="rizer_gamer" className="pl-10 bg-muted/30" required value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="gamer@example.com" className="pl-10 bg-muted/30" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-password" type="password" placeholder="••••••••" className="pl-10 bg-muted/30" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full font-bold h-11 neon-glow" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to Rizer Store's Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
