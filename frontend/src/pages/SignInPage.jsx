import { SignIn } from "@clerk/react";
import { AuthShell } from "@/components/AuthShell";
import { useI18n } from "@/i18n/i18n-context";

// Clerk's card sits inside our frame, so drop its own shadow/border
const embedded = { elements: { cardBox: "shadow-none border-0", card: "shadow-none" } };

export function SignInPage() {
  const { t } = useI18n();

  return (
    <AuthShell title={t("common.signInTitle")} description={t("common.signInSub")}>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/" appearance={embedded} />
    </AuthShell>
  );
}
