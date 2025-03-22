
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForms";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  
  // Parse mode from URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get("mode");
    
    if (modeParam === "login" || modeParam === "signup") {
      setMode(modeParam);
    }
  }, [location]);
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    
    // Update URL without reloading the page
    const newMode = mode === "login" ? "signup" : "login";
    navigate(`/auth?mode=${newMode}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <AuthForm mode={mode} onToggleMode={toggleMode} />
    </div>
  );
};

export default Auth;
