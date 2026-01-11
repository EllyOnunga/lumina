import { Switch, Route } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { useAnalytics } from "@/hooks/use-analytics";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/lib/protected-route";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { CurrencyProvider } from "@/hooks/use-currency";
import { ThemeProvider } from "@/components/theme-provider";

const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const AuthPage = lazy(() => import("@/pages/auth"));
const Orders = lazy(() => import("@/pages/orders"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const About = lazy(() => import("@/pages/about"));
const Account = lazy(() => import("@/pages/account"));
const Checkout = lazy(() => import("@/pages/checkout"));
const CategoryPage = lazy(() => import("@/pages/category"));
const Compare = lazy(() => import("@/pages/compare"));
const AdminCustomers = lazy(() => import("@/pages/admin/customers"));
const AdminReturns = lazy(() => import("@/pages/admin/returns"));
const BlogIndex = lazy(() => import("@/pages/blog-index"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const PageViewer = lazy(() => import("@/pages/page-viewer"));
const BlogManager = lazy(() => import("@/pages/admin/blog-manager"));
const BlogEditor = lazy(() => import("@/pages/admin/blog-editor"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Marketplace = lazy(() => import("@/pages/admin/marketplace"));
const ReturnsPolicy = lazy(() => import("@/pages/returns"));
const RequestReturn = lazy(() => import("@/pages/request-return"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));

function Router() {
  useAnalytics();
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/category/:id" component={CategoryPage} />
        <Route path="/compare" component={Compare} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/blog" component={BlogIndex} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/pages/:slug" component={PageViewer} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <ProtectedRoute path="/account" component={Account} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/returns" component={ReturnsPolicy} />
        <ProtectedRoute path="/request-return/:orderId" component={RequestReturn} />
        <ProtectedRoute path="/orders" component={Orders} />
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
        <ProtectedRoute path="/admin/products" component={AdminDashboard} />
        <ProtectedRoute path="/admin/orders" component={AdminDashboard} />
        <ProtectedRoute path="/admin/users" component={AdminDashboard} />
        <ProtectedRoute path="/admin/inventory" component={AdminDashboard} />
        <ProtectedRoute path="/admin/taxonomy" component={AdminDashboard} />
        <ProtectedRoute path="/admin/customers" component={AdminCustomers} />
        <ProtectedRoute path="/admin/returns" component={AdminReturns} />
        <ProtectedRoute path="/admin/blog" component={BlogManager} />
        <ProtectedRoute path="/admin/blog/new" component={BlogEditor} />
        <ProtectedRoute path="/admin/blog/edit/:id" component={BlogEditor} />
        <ProtectedRoute path="/admin/marketplace" component={Marketplace} />
        <ProtectedRoute path="/admin/settings" component={AdminSettings} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HelmetProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <CurrencyProvider>
              <Toaster />
              <Router />
            </CurrencyProvider>
          </ThemeProvider>
        </HelmetProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;