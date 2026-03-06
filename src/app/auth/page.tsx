
"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Lock, Mail, User as UserIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, isLoading: isContextLoading } = useAppContext();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!isContextLoading && currentUser) {
      router.push('/');
    }
  }, [currentUser, isContextLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ title: "Configuration Error", description: "Auth service is unavailable.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome Back!", description: "Log in successful." });
      router.push('/');
    } catch (error: any) {
      let message = "Invalid email or password.";
      if (error.code === 'auth/invalid-credential') message = "Incorrect credentials.";
      if (error.code === 'auth/user-not-found') message = "Account not found.";
      
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) {
      toast({ title: "Configuration Error", description: "Database services unavailable.", variant: "destructive" });
      return;
    }
    
    if (username.trim().length < 3) {
      toast({ title: "Username too short", description: "Minimum 3 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      const newUserProfile = {
        id: user.uid,
        username: username.trim(),
        email: email.trim(),
        balance: 0,
        role: 'user',
        createdAt: Date.now()
      };

      await setDoc(doc(db, "users", user.uid), newUserProfile);
      toast({ title: "Success!", description: "Account created successfully." });
      router.push('/');
    } catch (error: any) {
      let message = "Could not create account.";
      if (error.code === 'auth/email-already-in-use') {
        message = "Email already exists. Please login.";
        setActiveTab('login');
      } else if (error.code === 'auth/weak-password') {
        message = "Password should be at least 6 characters.";
      }
      toast({ title: "Signup Failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isContextLoading) {
    return (
      <div className="container min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Entering Secure Gateway...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex justify-center items-center">
      <div className="w-full max-w-md space-y-6">
        <Card className="glass-card border-white/5 neon-glow overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary mx-auto mb-4 neon-glow">
              <Gamepad2 className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">Rizer Store</CardTitle>
            <CardDescription>Premium Gaming Marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" placeholder="gamer@example.com" className="pl-10 bg-muted/30 border-white/5" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="login-password" type="password" placeholder="••••••••" className="pl-10 bg-muted/30 border-white/5" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full font-bold h-11 neon-glow" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Display Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="username" placeholder="SuperGamer" className="pl-10 bg-muted/30 border-white/5" required value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="gamer@example.com" className="pl-10 bg-muted/30 border-white/5" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type="password" placeholder="Minimum 6 characters" className="pl-10 bg-muted/30 border-white/5" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full font-bold h-11 neon-glow" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="text-center text-[10px] text-muted-foreground uppercase tracking-widest justify-center pb-6">
            Secure Rizer Store Gateway
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="container p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
