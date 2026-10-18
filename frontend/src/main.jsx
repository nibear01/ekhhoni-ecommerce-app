import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// fonts: Fraunces (display, Latin), Noto Serif Bengali (display, Bangla), Hind Siliguri (UI + body, both scripts).
// Each is split by unicode-range, so Bangla files only download when Bangla text is on screen.
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/noto-serif-bengali/wght.css";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "@/cart/CartProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ApiError } from "@/lib/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // retrying a 4xx (e.g. product 404) won't change the answer
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <App />
        </CartProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </StrictMode>,
);
