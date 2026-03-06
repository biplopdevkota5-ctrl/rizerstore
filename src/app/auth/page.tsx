
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Lock, Mail, User as UserIcon, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCurrentUser, isFirebaseConfigured, isLoading: isContextLoading } = useAppContext();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth || !db) {
      toast({ title: "Configuration Missing", description: "Firebase is not set up correctly.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({
          id: user.uid,
          email: user.email!,
          username: userData.username || user.displayName || 'User',
          balance: userData.balance || 0,
          role: userData.role || 'user'
        });
        
        toast({ title: "Login Successful", description: `Welcome back!` });
        
        if (userData.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        // Fallback for users with auth but no profile doc
        setCurrentUser({
          id: user.uid,
          email: user.email!,
          username: user.displayName || 'User',
          balance: 0,
          role: 'user'
        });
        router.push('/');
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      let message = "Invalid email or password.";
      if (error.code === 'auth/user-not-found') message = "Account not found.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password.";
      if (error.code === 'auth/invalid-credential') message = "Incorrect login credentials.";
      
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth || !db) {
      toast({ title: "Configuration Missing", description: "Firebase is not set up correctly.", variant: "destructive" });
      return;
    }
    if (username.length < 3) {
      toast({ title: "Invalid Username", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      const newUserProfile = {
        id: user.uid,
        username,
        email,
        balance: 0,
        role: 'user',
        createdAt: Date.now()
      };

      await setDoc(doc(db, "users", user.uid), newUserProfile);
      
      setCurrentUser({
        id: user.uid,
        username,
        email,
        balance: 0,
        role: 'user'
      });

      toast({ title: "Account Created!", description: "Welcome to Rizer Store." });
      router.push('/');
    } catch (error: any) {
      console.error("Signup Error:", error);
      let message = "Could not create account.";
      if (error.code === 'auth/email-already-in-use') message = "Email already in use.";
      if (error.code === 'auth/weak-password') message = "Password is too weak.";
      
      toast({ title: "Signup Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // If the app is initializing auth state
  if (isContextLoading) {
    return (
      <div className="container p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Initializing connection...</p>
      </div>
    );
  }

  // If Firebase keys are missing
  if (!isFirebaseConfigured) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <Card className="w-full max-w-md glass-card border-primary/20 bg-primary/5">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Setup Required</CardTitle>
            <CardDescription>Firebase keys are missing in your environment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background/50 text-sm space-y-2">
              <p className="font-bold">Add these to your Netlify dashboard:</p>
              <ul className="list-disc list-inside opacity-70">
                <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
              </ul>
            </div>
            <Button className="w-full gap-2" variant="outline" onClick={() => window.open('https://console.firebase.google.com/', '_blank')}>
              Go to Firebase Console <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex justify-center items-center">
      <div className="w-full max-w-md space-y-6">
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
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-email" 
                        placeholder="gamer@example.com" 
                        className="pl-10 bg-muted/30" 
                        type="email" 
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
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
                    <Label htmlFor="signup-email">Email Address</Label>
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
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
    <Suspense fallback={<div className="container p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p>Loading Authentication...</p>
    </div>}>
      <AuthContent />
    </Suspense>
  );
}
