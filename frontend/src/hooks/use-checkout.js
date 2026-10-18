import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { ApiError, apiFetch } from "@/lib/api";

/**
 * starts an SSLCommerz payment for the cart and sends the browser to its hosted payment page.
 * `customer` = delivery details { name, phone, address, city, postcode }.
 */
export function useCheckout() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ items, customer }) => {
      const token = await getToken();
      return apiFetch("/api/checkout", {
        method: "POST",
        token,
        body: {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customer,
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
      if (error.message === "Invalid checkout") return "cart.errDetails";
      if (error.message.startsWith("Total below")) return "cart.errMinimum";
      return "cart.errGeneric";
    case 503:
      return "cart.errPayments";
    default:
      return "cart.errGeneric";
  }
}
