import { useState, useEffect } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function AddCardForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Please check your card details");
        setIsLoading(false);
        return;
      }

      const { error: confirmError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${import.meta.env.MODE === 'production' ? '/kotsu-sensei-practice' : ''}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || "Failed to save card");
        setIsLoading(false);
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Card was successfully saved
        await queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
        
        toast({
          title: "Card added successfully",
          description: "Your card has been saved and is ready to use.",
        });

        onSuccess?.();
        onClose();
        setIsLoading(false);
        return;
      }

      // If we get here, something unexpected happened
      setError("Card setup completed but status is unclear. Please refresh and try again.");
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{
          layout: "tabs",
        }}
      />
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Card"
          )}
        </Button>
      </div>
    </form>
  );
}

export function AddCardDialog({ open, onOpenChange, onSuccess }: AddCardDialogProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && !clientSecret) {
      setIsLoading(true);
      supabase.functions.invoke("create-setup-intent")
        .then(({ data, error }) => {
          if (error) {
            console.error("Error creating setup intent:", error);
            toast({
              title: "Error",
              description: "Failed to initialize card form. Please try again.",
              variant: "destructive",
            });
            onOpenChange(false);
            return;
          }
          setClientSecret(data?.clientSecret || null);
        })
        .catch((err) => {
          console.error("Error:", err);
          toast({
            title: "Error",
            description: "Failed to initialize card form. Please try again.",
            variant: "destructive",
          });
          onOpenChange(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!open) {
      setClientSecret(null);
    }
  }, [open, clientSecret, onOpenChange, toast]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Add a credit or debit card to your account for faster checkout.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <AddCardForm 
              onSuccess={onSuccess} 
              onClose={() => onOpenChange(false)} 
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

