import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/supabase/settings";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["settings", user?.id],
    queryFn: () => getSettings(user!.id),
    enabled: !!user && open,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: any) => updateSettings(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", user?.id] });
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (field: string, value: boolean) => {
    updateMutation.mutate({ [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email" className="flex flex-col gap-1">
              <span className="font-medium">Email Notifications</span>
              <span className="text-xs text-muted-foreground">Receive updates via email</span>
            </Label>
            <Switch
              id="email"
              checked={settings?.email_notifications ?? true}
              onCheckedChange={(value) => handleToggle("email_notifications", value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="push" className="flex flex-col gap-1">
              <span className="font-medium">Push Notifications</span>
              <span className="text-xs text-muted-foreground">Receive browser notifications</span>
            </Label>
            <Switch
              id="push"
              checked={settings?.push_notifications ?? true}
              onCheckedChange={(value) => handleToggle("push_notifications", value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="study" className="flex flex-col gap-1">
              <span className="font-medium">Study Reminders</span>
              <span className="text-xs text-muted-foreground">Daily study notifications</span>
            </Label>
            <Switch
              id="study"
              checked={settings?.study_reminders ?? true}
              onCheckedChange={(value) => handleToggle("study_reminders", value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="test" className="flex flex-col gap-1">
              <span className="font-medium">Test Reminders</span>
              <span className="text-xs text-muted-foreground">Mock test notifications</span>
            </Label>
            <Switch
              id="test"
              checked={settings?.test_reminders ?? true}
              onCheckedChange={(value) => handleToggle("test_reminders", value)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
