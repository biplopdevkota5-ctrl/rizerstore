"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import { db } from "@/lib/db";
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
  const { setCurrentUser, syncData } = useAppContext();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Admin override
    if (email === 'admin@rizer.store' && password === '090102030405') {
      const adminUser = { id: 'admin-id', username: 'Admin', email: 'admin@rizer.store', balance: 999999, role: 'admin' as const };
      setCurrentUser(adminUser);
      toast({ title: "Admin Login Successful", description: "Welcome to the control panel." });
      router.push('/admin/dashboard');
      setIsLoading(false);
      return;
    }

    const users = db.getUsers();
    const user = users.find(u => (u.email === email || u.username === email) && u.password === password);

    if (user) {
      setCurrentUser(user);
      toast({ title: "Welcome back!", description: `Logged in as ${user.username}` });
      router.push('/');
    } else {
      toast({ title: "Login Failed", description: "Invalid email/username or password.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const users = db.getUsers();
    
    if (users.some(u => u.username === username)) {
      toast({ title: "Signup Failed", description: "Username already taken.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (users.some(u => u.email === email)) {
      toast({ title: "Signup Failed", description: "Email already registered.", variant: "destructive" });
      setIsLoading(false);
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

    const updatedUsers = [...users, newUser];
    db.saveUsers(updatedUsers);
    setCurrentUser(newUser);
    syncData();

    toast({ title: "Account Created!", description: "Welcome to Rizer Store." });
    router.push('/');
    setIsLoading(false);
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
                    <Input 
                      id="login-email" 
                      placeholder="Enter your email" 
                      className="pl-10 bg-muted/30" 
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    />
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
                    <Input 
                      id="username" 
                      placeholder="rizer_gamer" 
                      className="pl-10 bg-muted/30" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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