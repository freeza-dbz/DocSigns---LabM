import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentDetail from "./pages/DocumentDetail";
import SendDocument from "./pages/SendDocument";
import PublicSign from "./pages/PublicSign";
import AuditTrail from "./pages/AuditTrail";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

// Layout
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

const queryClient = new QueryClient();

const Layout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<Placeholder title="Forgot Password" message="Password recovery page coming soon" />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents/upload"
                  element={
                    <ProtectedRoute>
                      <DocumentUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents/:documentId"
                  element={
                    <ProtectedRoute>
                      <DocumentDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/documents/:documentId/send"
                  element={
                    <ProtectedRoute>
                      <SendDocument />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit-trail/:documentId"
                  element={
                    <ProtectedRoute>
                      <AuditTrail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sign/:token"
                  element={<PublicSign />}
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
