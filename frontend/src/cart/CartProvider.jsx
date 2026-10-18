import { useEffect, useMemo, useReducer } from "react";
import { CartContext, MAX_QUANTITY } from "./cart-context";

const STORAGE_KEY = "ekhhoni:cart:v1";

/**
 * Cart lines keep a snapshot of the product for display only.
 * The backend re-prices everything from the DB at checkout, so a stale price here can't be exploited.
 */
function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clampQuantity(quantity) {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

function cartReducer(items, action) {
  switch (action.type) {
    case "add": {
      const { product, quantity } = action;
      const existing = items.find((i) => i.productId === product.id);
      if (existing) {
        return items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: clampQuantity(i.quantity + quantity) }
            : i,
        );
      }
      return [
        ...items,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          currency: product.currency,
          imageUrl: product.imageUrl,
          quantity: clampQuantity(quantity),
        },
      ];
    }
    case "setQuantity":
      return items.map((i) =>
        i.productId === action.productId
          ? { ...i, quantity: clampQuantity(action.quantity) }
          : i,
      );
    case "remove":
      return items.filter((i) => i.productId !== action.productId);
    case "clear":
      return [];
    default:
      return items;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage can be unavailable (private mode, quota); the cart still works in memory
    }
  }, [items]);

  // `dispatch` never changes, so these stay stable and are safe in effect deps
  const actions = useMemo(
    () => ({
      add: (product, quantity = 1) => dispatch({ type: "add", product, quantity }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: "setQuantity", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [],
  );

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      ...actions,
    }),
    [items, actions],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
