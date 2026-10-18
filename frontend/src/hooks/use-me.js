import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

/** the signed-in user's store account ({ id, email, displayName, role, … }); idle when signed out */
export function useMe() {
  const { isSignedIn, userId } = useAuth();
  const api = useApi();

  return useQuery({
    queryKey: ["me", userId],
    queryFn: () => api("/api/me"),
    enabled: Boolean(isSignedIn),
    staleTime: 5 * 60_000,
  });
}

export function useIsAdmin() {
  const me = useMe();
  return me.data?.role === "admin";
}
