import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function logout(): Promise<void> {
  window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'admin' | 'user'>('admin');

  // Persist viewMode in session storage
  useEffect(() => {
    const savedMode = sessionStorage.getItem('viewMode');
    if (savedMode === 'admin' || savedMode === 'user') {
      setViewMode(savedMode);
    }
  }, []);

  const handleSetViewMode = (mode: 'admin' | 'user') => {
    setViewMode(mode);
    sessionStorage.setItem('viewMode', mode);
  };

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      sessionStorage.removeItem('viewMode');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    viewMode: user?.isAdmin ? viewMode : 'user',
    setViewMode: handleSetViewMode,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
