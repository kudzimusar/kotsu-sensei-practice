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
import Account from "./pages/Account";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import BookingPayment from "./pages/BookingPayment";
import MyBookings from "./pages/MyBookings";
import PracticeRooms from "./pages/PracticeRooms";
import PracticeRoomDetails from "./pages/PracticeRoomDetails";
import InstructorProfile from "./pages/InstructorProfile";
import InstructorDashboard from "./pages/InstructorDashboard";
import ShareReferral from "./pages/ShareReferral";
import Tips from "./pages/Tips";

const queryClient = new QueryClient();

// Determine the base path for routing based on environment
const basename = import.meta.env.PROD ? '/kotsu-sensei-practice' : '';

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
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/ai-chat" element={<AIChatbot />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><QuestionGenerator /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/booking/:id/payment" element={<ProtectedRoute><BookingPayment /></ProtectedRoute>} />
          <Route path="/booking/:id/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/practice-rooms" element={<ProtectedRoute><PracticeRooms /></ProtectedRoute>} />
          <Route path="/practice-room/:id" element={<ProtectedRoute><PracticeRoomDetails /></ProtectedRoute>} />
          <Route path="/practice-room/:id/payment" element={<ProtectedRoute><BookingPayment /></ProtectedRoute>} />
          <Route path="/instructor/:id" element={<InstructorProfile />} />
          <Route path="/instructor-dashboard" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/share-referral" element={<ProtectedRoute><ShareReferral /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
