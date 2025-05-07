import { FaDiscord, FaInfoCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [discordError, setDiscordError] = useState<string | null>(null);

  // Function to redirect to Discord OAuth login
  const handleDiscordLogin = () => {
    console.log("Starting Discord authentication process...");
    window.location.href = "/api/auth/discord";
  };

  // Form for local login
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: { username: string; password: string }) => {
    setLoading(true);
    try {
      await apiRequest(
        "POST", 
        "/api/auth/login",
        data
      );
      
      toast({
        title: "Login successful",
        description: "You are now logged in",
      });
      
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for OAuth errors on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    if (error) {
      setDiscordError(error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: `Discord login failed: ${error}`,
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        {discordError === "discord_auth_error" && (
          <Alert variant="destructive" className="mb-4 bg-red-900 border-red-800">
            <FaInfoCircle className="h-4 w-4" />
            <AlertTitle>Discord OAuth Error</AlertTitle>
            <AlertDescription>
              There was an issue with Discord authentication. Please check the OAuth redirect URL.
              <Button 
                variant="link" 
                className="text-blue-400 p-0 h-auto font-normal" 
                onClick={() => setLocation("/discord-debug")}
              >
                View OAuth Debug Info
              </Button>
            </AlertDescription>
          </Alert>
        )}
      
        <Card className="bg-[#2D3136] border-gray-700 shadow-xl">
          <CardHeader className="space-y-1 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-[#5865F2] flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-white"
              >
                <path d="M10.1 3.5a10 10 0 0 1 3.8 0" />
                <path d="M13.9 20.5a10 10 0 0 1-3.8 0" />
                <path d="M10.1 3.5A10 10 0 0 0 4 13.5" />
                <path d="M20 13.5a10 10 0 0 0-6.1-10" />
                <path d="M13.9 20.5a10 10 0 0 0 6.1-7" />
                <path d="M10.1 20.5A10 10 0 0 1 4 13.5" />
                <path d="M13.9 3.5A10 10 0 0 1 20 10.5" />
                <path d="M10.1 20.5a10 10 0 0 1-6.1-7" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Giveaway Dashboard</CardTitle>
            <CardDescription className="text-[#8E9297]">
              Sign in to access the giveaway management system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8 px-8">
            <Button 
              onClick={handleDiscordLogin}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-6 flex items-center justify-center gap-2 text-lg"
            >
              <FaDiscord className="text-2xl" />
              Login with Discord
            </Button>
            
            <div className="relative my-6">
              <Separator className="my-4" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2D3136] px-2 text-[#8E9297] text-sm">
                OR
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} className="bg-[#36393F] border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} className="bg-[#36393F] border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-sm text-center text-[#8E9297]">
              <p>Test Account (Admin): admin / admin123</p>
              <p>Test Account (Staff): staff / staff123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}