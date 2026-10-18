import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCart } from "@/cart/cart-context";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";

/** adds to the cart and confirms with a toast that links to the cart */
export function useAddToCart() {
  const { add } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (product, quantity = 1) => {
    add(product, quantity);
    toast.success(t("common.added"), {
      description: (
        <span lang={scriptLang(product.name)}>
          {quantity > 1 ? t("common.addedQty", { n: quantity, name: product.name }) : product.name}
        </span>
      ),
      action: { label: t("common.viewCart"), onClick: () => navigate("/cart") },
    });
  };
}
