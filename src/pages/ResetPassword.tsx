
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Shield, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import MysqlService from "@/services/MysqlService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError("Reset token is missing");
    }
  }, []);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
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
      const result = await MysqlService.resetPassword(authConfig, token, password);
      
      if (result.success) {
        setSuccess("Password has been reset successfully!");
        toast({
          title: "Password reset successful",
          description: "You can now login with your new password",
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred while resetting password");
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
            Reset your password
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
              <Shield className="h-5 w-5" />
              Reset Password
            </CardTitle>
            <CardDescription>
              Enter your new password
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
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
                    minLength={8}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10"
                    minLength={8}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full gradient-btn" 
                disabled={loading || !token}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
