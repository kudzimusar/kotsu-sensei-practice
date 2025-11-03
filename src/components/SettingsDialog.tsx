import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/supabase/settings";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();
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

  const handleToggle = (field: string, value: boolean | string) => {
    if (field === 'language') {
      setLanguage(value as 'en' | 'ja');
    }
    updateMutation.mutate({ [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.language', 'Settings')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              {t('settings.language', 'Language')} / 言語
            </Label>
            <Select
              value={language}
              onValueChange={(value) => handleToggle("language", value)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email" className="flex flex-col gap-1">
              <span className="font-medium">{t('settings.email_notifications', 'Email Notifications')}</span>
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
              <span className="font-medium">{t('settings.push_notifications', 'Push Notifications')}</span>
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
              <span className="font-medium">{t('settings.study_reminders', 'Study Reminders')}</span>
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
              <span className="font-medium">{t('settings.test_reminders', 'Test Reminders')}</span>
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
