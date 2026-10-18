import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { ApiError, apiFetch } from "@/lib/api";

/** starts a Polar checkout for the cart and redirects the browser to Polar's hosted page */
export function useCheckout() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (items) => {
      const token = await getToken();
      return apiFetch("/api/checkout", {
        method: "POST",
        token,
        body: {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      });
    },
    onSuccess: ({ checkoutUrl }) => {
      window.location.assign(checkoutUrl);
    },
  });
}

/** turns a checkout failure into a message key (cart namespace) a shopper can act on */
export function checkoutErrorKey(error) {
  if (!(error instanceof ApiError)) return "cart.errNetwork";
  switch (error.status) {
    case 401:
      return "cart.errSignIn";
    case 400:
      if (error.message === "One or more products are invalid") return "cart.errUnavailable";
      if (error.message.startsWith("Total below")) return "cart.errMinimum";
      return "cart.errGeneric";
    case 503:
      return error.message === "Account not synced yet" ? "cart.errSyncing" : "cart.errPayments";
    default:
      return "cart.errGeneric";
  }
}
