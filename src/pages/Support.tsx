import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupportTicket } from "@/lib/supabase/support";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Support = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Support ticket submitted successfully!");
      setSubject("");
      setMessage("");
    },
    onError: (error) => {
      toast.error("Failed to submit support ticket. Please try again.");
      console.error("Error submitting support ticket:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to submit a support ticket");
      return;
    }
    
    mutation.mutate({ user_id: user.id, subject, message });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6 min-h-[44px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">Support</h1>
          <p className="text-muted-foreground leading-relaxed max-w-prose">
            Need help? We're here to assist you. Submit a support ticket below and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm sm:text-base">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="min-h-[44px] text-base sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm sm:text-base">Message</Label>
              <Textarea
                id="message"
                placeholder="Please provide detailed information about your issue or question"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="text-base sm:text-sm min-h-[120px] sm:min-h-[160px]"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {mutation.isPending ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </div>

        <div className="mt-6 sm:mt-8 bg-muted/50 border border-border rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Other Ways to Reach Us</h2>
          <p className="text-muted-foreground">
            Email: <a href="mailto:kudzimusar@gmail.com" className="text-primary hover:underline min-h-[44px] inline-flex items-center">kudzimusar@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
