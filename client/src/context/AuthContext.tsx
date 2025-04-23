import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthContextType, User, RegisterFormData } from "../lib/types";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

console.log("AuthContext.tsx: Loading module");

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => { throw new Error("Not implemented"); },
  register: async () => { throw new Error("Not implemented"); },
  logout: async () => { throw new Error("Not implemented"); },
  updateUser: async () => { throw new Error("Not implemented"); }
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  console.log("AuthProvider: Component rendering");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    console.log("AuthProvider: Running useEffect");
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      const userData = await response.json();
      
      setUser(userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
      
      return userData;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/auth/register', data);
      const userData = await response.json();
      
      setUser(userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.firstName}!`,
      });
      
      return userData;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Registration failed. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await apiRequest('POST', '/api/auth/logout', {});
      
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user function
  const updateUser = async (data: Partial<User>) => {
    try {
      setLoading(true);
      const response = await apiRequest('PUT', '/api/auth/me', data);
      const updatedUser = await response.json();
      
      setUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      return updatedUser;
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  console.log("AuthProvider: Providing context", value);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using the auth context
export function useAuth() {
  console.log("useAuth: Hook called");
  const context = useContext(AuthContext);
  console.log("useAuth: Context value", context);
  return context;
}
