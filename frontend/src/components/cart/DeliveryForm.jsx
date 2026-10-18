import { FormField } from "@/components/FormField";
import { useI18n } from "@/i18n/i18n-context";

/** delivery details collected before payment; SSLCommerz requires name, phone and address */
export function DeliveryForm({ id, value, onChange, errors, onSubmit }) {
  const { t } = useI18n();
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });
  const err = (field) => (errors[field] ? t(errors[field]) : undefined);

  return (
    <form
      id={id}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-[20px] border border-border bg-card p-5 sm:p-6"
    >
      <h2 className="display text-2xl">{t("cart.deliveryTitle")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("cart.deliveryHint")}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <FormField label={t("cart.fieldName")} error={err("name")}>
          <input className="text-input" autoComplete="name" value={value.name} onChange={set("name")} />
        </FormField>
        <FormField label={t("cart.fieldPhone")} hint={t("cart.fieldPhoneHint")} error={err("phone")}>
          <input
            className="text-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            lang="en"
            value={value.phone}
            onChange={set("phone")}
          />
        </FormField>
        <FormField
          label={t("cart.fieldAddress")}
          hint={t("cart.fieldAddressHint")}
          error={err("address")}
          className="sm:col-span-2"
        >
          <textarea
            className="text-input min-h-20 resize-y"
            autoComplete="street-address"
            value={value.address}
            onChange={set("address")}
          />
        </FormField>
        <FormField label={t("cart.fieldCity")} error={err("city")}>
          <input className="text-input" autoComplete="address-level2" value={value.city} onChange={set("city")} />
        </FormField>
        <FormField label={t("cart.fieldPostcode")}>
          <input
            className="text-input"
            inputMode="numeric"
            autoComplete="postal-code"
            lang="en"
            value={value.postcode}
            onChange={set("postcode")}
          />
        </FormField>
      </div>
    </form>
  );
}
