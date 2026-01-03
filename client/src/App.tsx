import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import GuestReception from "./pages/GuestReception";
import TicketDisplay from "./pages/TicketDisplay";
import KioskReception from "./pages/KioskReception";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback";

function Router() {
  return (
    <Switch>
      {/* Home */}
      <Route path={"/"} component={Home} />

      {/* Auth Callback - Handled by Frontend */}
      <Route path={"/auth/callback"} component={AuthCallback} />

      {/* Guest Routes */}
      <Route path={"/w/:storeSlug"} component={GuestReception} />
      <Route path={"/w/:storeSlug/ticket/:token"} component={TicketDisplay} />

      {/* Kiosk Route */}
      <Route path={"/kiosk/:storeSlug"} component={KioskReception} />

      {/* Admin Routes */}
      {/* Admin Routes */}
      <Route path="/admin/:storeSlug">
        {(params) => {
          console.log("[Router] Matching /admin route", params);
          return <ProtectedRoute component={AdminDashboard} {...params} />;
        }}
      </Route>
      <Route path="/admin/:storeSlug/settings">
        {(params) => <ProtectedRoute component={AdminSettings} {...params} />}
      </Route>

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route>
        {(params) => {
          console.log("[Router] No match found. Current params:", params);
          console.log("[Router] Current Location:", window.location.pathname);
          return <NotFound />;
        }}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
