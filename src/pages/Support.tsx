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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Support</h1>
          <p className="text-muted-foreground leading-relaxed">
            Need help? We're here to assist you. Submit a support ticket below and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Please provide detailed information about your issue or question"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                required
              />
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </div>

        <div className="mt-8 bg-muted/50 border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Other Ways to Reach Us</h2>
          <p className="text-muted-foreground">
            Email: <a href="mailto:kudzimusar@gmail.com" className="text-primary hover:underline">kudzimusar@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
