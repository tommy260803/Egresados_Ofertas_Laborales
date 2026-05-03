import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { clearAuthCookies, getAccessTokenCookie, setAuthCookies } from "@/lib/auth/cookies";

interface User {
  userId: number;
  email: string;
  rol: "administrador" | "egresado" | "empresa";
}

interface JwtPayload {
  sub: number;
  email: string;
  rol: "administrador" | "egresado" | "empresa";
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const routeByRole = (rol: User["rol"]) => {
    return rol === "administrador" ? "/admin/dashboard" : rol === "egresado" ? "/egresado/dashboard" : "/empresa/dashboard";
  };

  const login = trpc.auth.login.useMutation({
    onSuccess: (data: { accessToken: string; refreshToken: string; user: { id: number; email: string; rol: string } }) => {
      setAuthCookies(data.accessToken, data.refreshToken);
      const decoded = jwtDecode<JwtPayload>(data.accessToken);
      setUser({ userId: decoded.sub, email: decoded.email, rol: decoded.rol });
      router.push(routeByRole(decoded.rol));
    },
  });

  const register = trpc.auth.register.useMutation({
    onSuccess: (data: { accessToken: string; refreshToken: string; user: { id: number; email: string; rol: string } }) => {
      setAuthCookies(data.accessToken, data.refreshToken);
      const decoded = jwtDecode<JwtPayload>(data.accessToken);
      setUser({ userId: decoded.sub, email: decoded.email, rol: decoded.rol });
      router.push(routeByRole(decoded.rol));
    },
  });

  const logout = () => {
    clearAuthCookies();
    setUser(null);
    router.push("/");
  };

  const refresh = trpc.auth.refresh.useMutation({
    onSuccess: (data: { accessToken: string; refreshToken: string }) => {
      setAuthCookies(data.accessToken, data.refreshToken);
      const decoded = jwtDecode<JwtPayload>(data.accessToken);
      setUser({ userId: decoded.sub, email: decoded.email, rol: decoded.rol });
    },
    onError: () => {
      logout();
    },
  });

  useEffect(() => {
    const token = getAccessTokenCookie();
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser({ userId: decoded.sub, email: decoded.email, rol: decoded.rol });
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  return {
    login,
    register,
    logout,
    refresh,
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}