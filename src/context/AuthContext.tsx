
import React, { createContext, useState, useContext, useEffect } from "react";

// Types
type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data (replace with actual backend later)
const mockUsers = [
  {
    id: "1",
    email: "demo@example.com",
    name: "Demo User",
    password: "password123"
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("focusflow_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Auth functions
  const login = async (email: string, password: string) => {
    // Simulate API call delay
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // This would be replaced with actual API call
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error("Invalid email or password");
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    
    localStorage.setItem("focusflow_user", JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
    setIsLoading(false);
  };

  const signup = async (email: string, name: string, password: string) => {
    // Simulate API call delay
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      setIsLoading(false);
      throw new Error("User with this email already exists");
    }

    // In a real app, this would be handled by the backend
    const newUser = {
      id: String(mockUsers.length + 1),
      email,
      name,
      password
    };
    
    // Add to mock data (in real app, this would be saved to database)
    mockUsers.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem("focusflow_user", JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("focusflow_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
