import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, MapPin, Phone } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { StatusPill } from "@/components/admin/AdminBits";
import { useI18n } from "@/i18n/i18n-context";
import { scriptLang } from "@/i18n/format";
import { cn } from "@/lib/utils";

const STATUS = {
  paid: { tone: "green", key: "admin.statusPaid" },
  pending: { tone: "gold", key: "admin.statusPending" },
  failed: { tone: "red", key: "admin.statusFailed" },
};

/** one order: summary line that expands to items + delivery details */
export function OrderRow({ order }) {
  const { t, price, date } = useI18n();
  const [open, setOpen] = useState(false);
  const status = STATUS[order.status] ?? STATUS.pending;
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const customer = order.shipping?.name || order.user?.displayName || order.user?.email || t("admin.unknownCustomer");
  const ref = (order.tranId ?? order.id).slice(0, 8).toUpperCase();

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 text-left transition-colors hover:bg-muted/60 sm:grid-cols-[7rem_1fr_auto_auto_1.25rem]"
      >
        <span className="font-mono text-sm font-semibold">#{ref}</span>
        <span className="col-start-1 min-w-0 sm:col-start-auto">
          <span className="block truncate font-medium" lang={scriptLang(customer)}>
            {customer}
          </span>
          <span className="block text-[13px] text-muted-foreground">
            {date(order.createdAt)} · {t("admin.itemsCount", { n: itemCount })}
          </span>
        </span>
        <span className="row-start-1 justify-self-end sm:row-start-auto">
          <StatusPill tone={status.tone}>{t(status.key)}</StatusPill>
        </span>
        <span className="price justify-self-end text-lg">{price(order.totalCents)}</span>
        <ChevronDown
          className={cn("hidden size-5 text-muted-foreground transition-transform sm:block", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div className="grid gap-6 border-t border-dashed border-stitch bg-kantha/40 px-5 py-5 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{t("admin.items")}</h3>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-kantha">
                    <ProductImage src={item.product?.imageUrl} />
                  </span>
                  <span className="min-w-0 flex-1">
                    {item.product ? (
                      <Link
                        to={`/products/${item.product.slug}`}
                        target="_blank"
                        lang={scriptLang(item.product.name)}
                        className="block truncate font-medium hover:underline"
                      >
                        {item.product.name}
                      </Link>
                    ) : (
                      <span className="block truncate font-medium">—</span>
                    )}
                    <span className="text-[13px] text-muted-foreground">
                      {item.quantity} × {price(item.unitPriceCents)}
                    </span>
                  </span>
                  <span className="price">{price(item.quantity * item.unitPriceCents)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="mb-2 font-semibold text-muted-foreground">{t("admin.deliverTo")}</h3>
              {order.shipping ? (
                <div className="space-y-1.5 rounded-xl border border-border bg-card p-4">
                  <p className="font-semibold">{order.shipping.name}</p>
                  <p className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="whitespace-pre-line">
                      {order.shipping.address}, {order.shipping.city}
                      {order.shipping.postcode ? ` ${order.shipping.postcode}` : ""}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" aria-hidden />
                    <a href={`tel:${order.shipping.phone}`} className="hover:underline">
                      {order.shipping.phone}
                    </a>
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">{t("admin.noShipping")}</p>
              )}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
              {order.user?.email && (
                <>
                  <dt className="text-muted-foreground">{t("admin.email")}</dt>
                  <dd className="truncate">{order.user.email}</dd>
                </>
              )}
              {order.paymentMethod && (
                <>
                  <dt className="text-muted-foreground">{t("admin.colPayment")}</dt>
                  <dd>{order.paymentMethod}</dd>
                </>
              )}
              {order.tranId && (
                <>
                  <dt className="text-muted-foreground">tran_id</dt>
                  <dd className="truncate font-mono">{order.tranId}</dd>
                </>
              )}
              {order.valId && (
                <>
                  <dt className="text-muted-foreground">val_id</dt>
                  <dd className="truncate font-mono">{order.valId}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}
    </li>
  );
}
