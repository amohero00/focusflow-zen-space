
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoText } from "@/assets/logo";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface AuthFormProps {
  mode: "login" | "signup";
  onToggleMode: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const { login, signup, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === "login") {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        await signup(email, name, password);
        toast({
          title: "Account created!",
          description: "Your account has been successfully created.",
        });
      }
      navigate("/");
    } catch (error) {
      toast({
        title: "Authentication error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="flex flex-col items-center mb-8">
        <LogoText size={48} showTagline />
      </div>
      
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-display font-semibold mb-6 text-center">
          {mode === "login" ? "Welcome Back" : "Create an Account"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={mode === "login" ? "Enter your password" : "Create a password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : mode === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onToggleMode}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={onToggleMode}
                className="font-medium text-primary hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
      
      {/* Demo account */}
      {mode === "login" && (
        <div className="mt-4 text-sm text-center text-muted-foreground">
          <p>
            Demo account: <span className="font-medium">demo@example.com</span> / 
            <span className="font-medium"> password123</span>
          </p>
        </div>
      )}
    </motion.div>
  );
};
