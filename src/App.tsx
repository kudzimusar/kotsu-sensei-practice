import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Study from "./pages/Study";
import Tests from "./pages/Tests";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Support from "./pages/Support";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import QuestionGenerator from "./pages/QuestionGenerator";
import Lectures from "./pages/Lectures";
import Planner from "./pages/Planner";
import NotFound from "./pages/NotFound";
import AIChatbot from "./pages/AIChatbot";
import Flashcards from "./pages/Flashcards";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

// Use basename in production to match GitHub Pages subdirectory
const basename = import.meta.env.MODE === 'production' ? '/kotsu-sensei-practice' : undefined;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Index />} />
          <Route path="/study" element={<Study />} />
          <Route path="/lectures" element={<Lectures />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/ai-chat" element={<AIChatbot />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><QuestionGenerator /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
