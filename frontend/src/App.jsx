import { createBrowserRouter, RouterProvider } from "react-router";
import { RootLayout } from "@/layouts/RootLayout";
import { ShopPage } from "@/pages/ShopPage";
import { NewArrivalsPage } from "@/pages/NewArrivalsPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ProductPage } from "@/pages/ProductPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutReturnPage } from "@/pages/CheckoutReturnPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <ShopPage /> },
      { path: "/new", element: <NewArrivalsPage /> },
      { path: "/categories", element: <CategoriesPage /> },
      { path: "/categories/:category", element: <CategoryPage /> },
      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:slug", element: <ProductPage /> },
      // also Polar's `return_url` when a shopper backs out of checkout
      { path: "/cart", element: <CartPage /> },
      // Polar's `success_url`
      { path: "/checkout/return", element: <CheckoutReturnPage /> },
      // splat routes: Clerk adds its own sub-steps (e.g. /sign-up/verify-email-address)
      { path: "/sign-in/*", element: <SignInPage /> },
      { path: "/sign-up/*", element: <SignUpPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
