import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FaDiscord } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";

export default function AuthPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Parse error from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      switch (error) {
        case 'discord_auth_error':
          setErrorMsg('There was an error connecting to Discord. Please try again or use local login.');
          break;
        case 'no_user':
          setErrorMsg('Discord authentication failed. Please try again or use local login.');
          break;
        case 'login_error':
          setErrorMsg('There was an error during login. Please try again.');
          break;
        default:
          setErrorMsg('An unknown error occurred. Please try again.');
      }
    }
  }, []);

  // Function to redirect to Discord OAuth login
  const handleDiscordLogin = () => {
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Login form column */}
      <div className="flex-1 flex items-center justify-center p-4 bg-[#36393F]">
        <div className="w-full max-w-md">
          {errorMsg && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
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
      
      {/* Hero column */}
      <div className="flex-1 hidden md:flex flex-col justify-center items-center p-8 bg-gradient-to-br from-[#5865F2] to-[#7983F5] text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Mutual Giveaway System</h1>
          <div className="space-y-4">
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-2">Schedule & Manage Giveaways</h3>
              <p>Easily create, approve, and schedule mutual giveaways with other Discord servers.</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-2">Track Staff Performance</h3>
              <p>Comprehensive invite tracking and reporting to measure staff contributions.</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-2">Weekly Quotas & Reports</h3>
              <p>Automated staff reports and performance metrics every Sunday at 12 PM AEST.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}