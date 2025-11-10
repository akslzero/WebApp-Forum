import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(normalizeUser(response.data));
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(normalizeUser(response.data));
    } catch (error) {
      // ignore
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem("token", response.data.token);
      setUser(normalizeUser(response.data.user));
      toast({
        title: "Login berhasil",
        description: `Selamat datang kembali, ${response.data.user.displayName}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login gagal",
        description: error.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await authAPI.register({ username, email, password });
      localStorage.setItem("token", response.data.token);
      setUser(normalizeUser(response.data.user));
      toast({
        title: "Registrasi berhasil",
        description: "Akun Anda telah dibuat!",
      });
    } catch (error: any) {
      toast({
        title: "Registrasi gagal",
        description: error.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
      throw error;
    }
  };

  const normalizeUser = (u: any): User => {
    if (!u) return null as any;
    return {
      id: u.id || u._id,
      username: u.username,
      email: u.email,
      displayName: u.displayName || u.username,
      avatar: u.avatar || "",
    } as User;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast({
      title: "Logout berhasil",
      description: "Sampai jumpa lagi!",
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
