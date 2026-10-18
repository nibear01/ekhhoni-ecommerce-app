import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/use-api";

const keys = {
  stats: ["admin", "stats"],
  products: ["admin", "products"],
  orders: ["admin", "orders"],
  users: ["admin", "users"],
};

export function useAdminStats() {
  const api = useApi();
  return useQuery({ queryKey: keys.stats, queryFn: () => api("/api/admin/stats") });
}

export function useAdminProducts() {
  const api = useApi();
  return useQuery({
    queryKey: keys.products,
    queryFn: async () => (await api("/api/admin/products")).products,
  });
}

export function useAdminOrders() {
  const api = useApi();
  return useQuery({
    queryKey: keys.orders,
    queryFn: async () => (await api("/api/admin/orders")).orders,
  });
}

export function useAdminUsers() {
  const api = useApi();
  return useQuery({
    queryKey: keys.users,
    queryFn: async () => (await api("/api/admin/users")).users,
  });
}

/** after any catalogue change, refresh both the admin lists and the public storefront queries */
function useInvalidateCatalogue() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: keys.products });
    qc.invalidateQueries({ queryKey: keys.stats });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["product"] });
  };
}

/** create (no id) or update (with id) a product */
export function useSaveProduct() {
  const api = useApi();
  const invalidate = useInvalidateCatalogue();
  return useMutation({
    mutationFn: async ({ id, data }) =>
      (
        await api(id ? `/api/admin/products/${id}` : "/api/admin/products", {
          method: id ? "PATCH" : "POST",
          body: data,
        })
      ).product,
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const api = useApi();
  const invalidate = useInvalidateCatalogue();
  return useMutation({
    mutationFn: (id) => api(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export function useUpdateRole() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => api(`/api/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

/**
 * Uploads a file straight from the browser to ImageKit using one-time auth params from our API.
 * Returns { url, fileId }. `onProgress` receives 0–100.
 */
export function useImageUpload() {
  const api = useApi();

  return async function upload(file, onProgress) {
    const auth = await api("/api/admin/imagekit/auth");
    const form = new FormData();
    form.append("file", file);
    form.append("fileName", file.name);
    form.append("publicKey", auth.publicKey);
    form.append("signature", auth.signature);
    form.append("expire", String(auth.expire));
    form.append("token", auth.token);
    form.append("folder", "/products");
    form.append("useUniqueFileName", "true");

    // XHR rather than fetch so we can report upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.url, fileId: data.fileId });
        } else {
          reject(new Error(`ImageKit upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error("ImageKit upload failed"));
      xhr.send(form);
    });
  };
}
