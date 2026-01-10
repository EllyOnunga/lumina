import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Chrome, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" });

  const search = new URLSearchParams(window.location.search);
  const redirect = search.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/login", loginData);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation(redirect);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid credentials";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/register", registerData);
      // Auto login after register
      await apiRequest("POST", "/api/login", registerData);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation(redirect);
      toast({ title: "Account created", description: "You are now part of Lumina." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-md space-y-8 bg-secondary/30 p-8 border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl">Account</h1>
            <p className="text-sm text-muted-foreground">Join the Lumina community</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-background border border-border h-12 p-1">
              <TabsTrigger value="login" className="rounded-none data-[state=active]:bg-secondary">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-none data-[state=active]:bg-secondary">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    className="rounded-none border-border focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="rounded-none border-border focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-none uppercase tracking-widest font-bold" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="pt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username</Label>
                  <Input
                    id="reg-username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    className="rounded-none border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    className="rounded-none border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="rounded-none border-border"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
                <Button type="submit" className="w-full h-12 rounded-none uppercase tracking-widest font-bold" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="space-y-6 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                <span className="bg-[#1a1a1a] px-3 text-muted-foreground">Digital Identity Socials</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="rounded-none border-secondary/10 h-12 flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest hover:bg-secondary/5"
                onClick={() => window.location.href = "/api/auth/google"}
              >
                <Chrome className="w-4 h-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="rounded-none border-secondary/10 h-12 flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest hover:bg-secondary/5"
                onClick={() => window.location.href = "/api/auth/github"}
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}