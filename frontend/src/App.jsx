import { createBrowserRouter, RouterProvider } from "react-router";
import { AppShell } from "@/layouts/AppShell";
import { RootLayout } from "@/layouts/RootLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
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
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminProducts } from "@/pages/admin/AdminProducts";
import { AdminProductForm } from "@/pages/admin/AdminProductForm";
import { AdminOrders } from "@/pages/admin/AdminOrders";
import { AdminCustomers } from "@/pages/admin/AdminCustomers";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: "/", element: <ShopPage /> },
          { path: "/new", element: <NewArrivalsPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/categories/:category", element: <CategoryPage /> },
          { path: "/products", element: <ProductsPage /> },
          { path: "/products/:slug", element: <ProductPage /> },
          // checkout form lives here; SSLCommerz cancel/fail also lead back via /checkout/return
          { path: "/cart", element: <CartPage /> },
          // where the server sends shoppers after SSLCommerz (status=success|failed|cancelled)
          { path: "/checkout/return", element: <CheckoutReturnPage /> },
          // splat routes: Clerk adds its own sub-steps (e.g. /sign-up/verify-email-address)
          { path: "/sign-in/*", element: <SignInPage /> },
          { path: "/sign-up/*", element: <SignUpPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "products", element: <AdminProducts /> },
          { path: "products/new", element: <AdminProductForm /> },
          { path: "products/:id", element: <AdminProductForm /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "customers", element: <AdminCustomers /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
