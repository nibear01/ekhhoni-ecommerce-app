import { useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

/** apiFetch that attaches the signed-in user's Clerk session token */
export function useApi() {
  const { getToken } = useAuth();
  return useCallback(async (path, init = {}) => apiFetch(path, { ...init, token: await getToken() }), [getToken]);
}
