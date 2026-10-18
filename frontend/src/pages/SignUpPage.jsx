import { SignUp } from "@clerk/react";
import { AuthShell } from "@/components/AuthShell";
import { useI18n } from "@/i18n/i18n-context";

// Clerk's card sits inside our frame, so drop its own shadow/border
const embedded = { elements: { cardBox: "shadow-none border-0", card: "shadow-none" } };

export function SignUpPage() {
  const { t } = useI18n();

  return (
    <AuthShell title={t("common.signUpTitle")} description={t("common.signUpSub")}>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/" appearance={embedded} />
    </AuthShell>
  );
}
