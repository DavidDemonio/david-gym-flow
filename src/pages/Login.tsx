
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Key, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import MysqlService from "@/services/MysqlService";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Check if user is already logged in
  useEffect(() => {
    if (MysqlService.isLoggedIn()) {
      navigate('/');
    }
    
    // Check for verification token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify');
    if (verifyToken) {
      verifyEmail(verifyToken);
    }
    
    // Check for reset token in URL
    const resetToken = urlParams.get('reset');
    if (resetToken) {
      navigate(`/reset-password?token=${resetToken}`);
    }
  }, [navigate]);
  
  const verifyEmail = async (token: string) => {
    setLoading(true);
    const authConfig = MysqlService.getConfigFromLocalStorage('auth');
    
    if (!authConfig) {
      setError("Authentication database not configured");
      setLoading(false);
      return;
    }
    
    try {
      const result = await MysqlService.verifyEmail(authConfig, token);
      if (result.success) {
        setSuccess("Your email has been verified! You can now log in.");
        // Remove verification token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setError(result.message || "Email verification failed");
      }
    } catch (error) {
      setError("An error occurred while verifying your email");
      console.error("Email verification error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    const authConfig = MysqlService.getConfigFromLocalStorage('auth');
    
    if (!authConfig) {
      setError("Authentication database not configured");
      setLoading(false);
      return;
    }
    
    try {
      const result = await MysqlService.loginUser(authConfig, email, password);
      
      if (result.success) {
        setSuccess("Login successful!");
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const authConfig = MysqlService.getConfigFromLocalStorage('auth');
    
    if (!authConfig) {
      setError("Authentication database not configured");
      setLoading(false);
      return;
    }
    
    try {
      const result = await MysqlService.sendPasswordReset(authConfig, email);
      
      if (result.success) {
        setSuccess("Password reset instructions sent to your email");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred while sending password reset");
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fadeInUp">
          <h1 className="text-4xl font-bold gradient-text">David GymFlow</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
            Login to your account
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6 animate-shake">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 animate-fadeIn bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Success</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}
        
        <Card className="glass-card animate-fadeInUp animate-delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full gradient-btn" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
