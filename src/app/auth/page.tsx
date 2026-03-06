
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
import { Gamepad2, Lock, Mail, User as UserIcon, AlertTriangle } from "lucide-react";
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

  const isFirebaseConfigured = () => {
    // Basic check for placeholder values
    const config = (db as any)._app?.options;
    return config && config.apiKey && !config.apiKey.includes("YOUR_API_KEY");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured() && email !== 'admin@rizer.store') {
      toast({ 
        title: "Configuration Required", 
        description: "Firebase is not configured yet. Please update src/lib/firebase.ts with your credentials.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Hardcoded Admin Bypass
      if (email === 'admin@rizer.store' && password === '090102030405') {
        const adminUser = { id: 'admin-id', username: 'Admin', email: 'admin@rizer.store', balance: 999999, role: 'admin' as const };
        setCurrentUser(adminUser);
        toast({ title: "Admin Access Granted", description: "Redirecting to Dashboard..." });
        router.push('/admin/dashboard');
        return;
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email), where("password", "==", password));
      const qAlt = query(usersRef, where("username", "==", email), where("password", "==", password));
      
      const [snap, snapAlt] = await Promise.all([getDocs(q), getDocs(qAlt)]);
      const finalSnap = !snap.empty ? snap : snapAlt;

      if (!finalSnap.empty) {
        const user = finalSnap.docs[0].data() as any;
        setCurrentUser(user);
        toast({ title: "Login Successful", description: `Welcome back, ${user.username}!` });
        router.push('/');
      } else {
        toast({ title: "Invalid Credentials", description: "Please check your email/username and password.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast({ title: "Login Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured()) {
      toast({ 
        title: "Configuration Required", 
        description: "Firebase is not configured yet. Please update src/lib/firebase.ts with your credentials.", 
        variant: "destructive" 
      });
      return;
    }

    if (username.length < 3) {
      toast({ title: "Invalid Username", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const usersRef = collection(db, "users");
      const qUser = query(usersRef, where("username", "==", username));
      const qEmail = query(usersRef, where("email", "==", email));
      
      const [uSnap, eSnap] = await Promise.all([getDocs(qUser), getDocs(qEmail)]);

      if (!uSnap.empty) {
        toast({ title: "Signup Failed", description: "Username is already taken.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (!eSnap.empty) {
        toast({ title: "Signup Failed", description: "Email is already registered.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const userId = Math.random().toString(36).substring(2, 10);
      const newUser = {
        id: userId,
        username,
        email,
        password, // In a real app, never store plain text passwords
        balance: 0,
        role: 'user' as const
      };

      await dbService.saveUser(newUser);
      setCurrentUser(newUser);

      toast({ title: "Account Created!", description: "Welcome to Rizer Store community." });
      router.push('/');
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({ title: "Signup Error", description: "Could not connect to the database. Check your configuration.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex justify-center items-center">
      <div className="w-full max-w-md space-y-6">
        {!isFirebaseConfigured() && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-3 text-yellow-500">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold mb-1">Firebase Configuration Missing</p>
              <p>You need to update <strong>src/lib/firebase.ts</strong> with your real project keys for this page to work.</p>
            </div>
          </div>
        )}

        <Card className="glass-card border-white/5 neon-glow">
          <CardHeader className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary mx-auto mb-4 neon-glow">
              <Gamepad2 className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">Rizer Account</CardTitle>
            <CardDescription>Join the elite gaming community</CardDescription>
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
                      <Input 
                        id="login-email" 
                        placeholder="Enter email or username" 
                        className="pl-10 bg-muted/30" 
                        type="text" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 bg-muted/30" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full font-bold h-11 neon-glow" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Login to Store"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="username" 
                        placeholder="rizer_gamer" 
                        className="pl-10 bg-muted/30" 
                        required 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="gamer@example.com" 
                        className="pl-10 bg-muted/30" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 bg-muted/30" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={isLoading}
                      />
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Secure Gateway Protected
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="container p-20 text-center">Loading Authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
