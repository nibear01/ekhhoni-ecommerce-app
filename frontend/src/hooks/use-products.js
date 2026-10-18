import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useProducts(category) {
  return useQuery({
    queryKey: ["products", category ?? ""],
    queryFn: async () => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : "";
      const data = await apiFetch(`/api/products${qs}`);
      return data.products;
    },
    // keep the old grid on screen while switching categories
    placeholderData: keepPreviousData,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await apiFetch("/api/products/categories")).categories,
  });
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () =>
      (await apiFetch(`/api/products/${encodeURIComponent(slug)}`)).product,
    enabled: Boolean(slug),
  });
}
