import { useNavigate } from "react-router";
import { ClerkProvider } from "@clerk/react";
import { bnIN } from "@clerk/localizations";
import { useI18n } from "./i18n-context";

// Clerk's sign-in / sign-up / user menu follow the storefront language and brand colours.
const appearance = {
  variables: {
    colorPrimary: "#1d5a3e",
    borderRadius: "0.875rem",
    fontFamily: '"Hind Siliguri", system-ui, sans-serif',
  },
};

/** must render inside the router: Clerk navigates between its steps with react-router */
export function LocalizedClerkProvider({ children }) {
  const { lang } = useI18n();
  const navigate = useNavigate();

  return (
    <ClerkProvider
      localization={lang === "bn" ? bnIN : undefined}
      appearance={appearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}
