import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/supabase/settings";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { useToast } from "@/hooks/use-toast";
import { getUsageStats, resetUsage, shouldShowWarning, isUsageCritical } from "@/lib/tts/usageTracker";
import { Volume2, AlertTriangle, RefreshCw, CreditCard, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TTS_ENABLED_KEY = 'tts_enabled';
const TTS_AUTOPLAY_KEY = 'tts_autoplay';

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth();
  const { isPremium, subscription } = usePremium();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsAutoplay, setTtsAutoplay] = useState(false);
  const [usageStats, setUsageStats] = useState(getUsageStats());

  const { data: settings } = useQuery({
    queryKey: ["settings", user?.id],
    queryFn: () => getSettings(user!.id),
    enabled: !!user && open,
  });

  // Load TTS settings from localStorage
  useEffect(() => {
    if (open) {
      const enabled = localStorage.getItem(TTS_ENABLED_KEY);
      const autoplay = localStorage.getItem(TTS_AUTOPLAY_KEY);
      setTtsEnabled(enabled !== 'false');
      setTtsAutoplay(autoplay === 'true');
      setUsageStats(getUsageStats());
    }
  }, [open]);

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

  const handleTtsToggle = (enabled: boolean) => {
    setTtsEnabled(enabled);
    localStorage.setItem(TTS_ENABLED_KEY, String(enabled));
    toast({
      title: enabled ? "Text-to-Speech enabled" : "Text-to-Speech disabled",
      description: enabled ? "You can now use TTS features throughout the app." : "TTS features are now disabled.",
    });
  };

  const handleAutoplayToggle = (autoplay: boolean) => {
    setTtsAutoplay(autoplay);
    localStorage.setItem(TTS_AUTOPLAY_KEY, String(autoplay));
    toast({
      title: autoplay ? "Auto-play enabled" : "Auto-play disabled",
      description: autoplay ? "Content will automatically play when available." : "You'll need to manually start TTS.",
    });
  };

  const handleResetUsage = () => {
    resetUsage();
    setUsageStats(getUsageStats());
    toast({
      title: "Usage reset",
      description: "TTS usage statistics have been reset for this month.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Account Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Account</h3>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-2">
                {isPremium ? (
                  <>
                    <Crown className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Premium Subscription</p>
                      <p className="text-xs text-muted-foreground">
                        {subscription?.plan_type
                          ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)
                          : "Active"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Free Plan</p>
                    <p className="text-xs text-muted-foreground">Upgrade to unlock premium features</p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/account");
                }}
              >
                Manage
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

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

          <Separator className="my-4" />

          {/* TTS Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Text-to-Speech</h3>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="tts-enabled" className="flex flex-col gap-1">
                <span className="font-medium">Enable TTS</span>
                <span className="text-xs text-muted-foreground">Listen to content instead of reading</span>
              </Label>
              <Switch
                id="tts-enabled"
                checked={ttsEnabled}
                onCheckedChange={handleTtsToggle}
              />
            </div>

            {ttsEnabled && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="tts-autoplay" className="flex flex-col gap-1">
                    <span className="font-medium">Auto-play</span>
                    <span className="text-xs text-muted-foreground">Automatically play audio when available</span>
                  </Label>
                  <Switch
                    id="tts-autoplay"
                    checked={ttsAutoplay}
                    onCheckedChange={handleAutoplayToggle}
                  />
                </div>

                {/* Usage Statistics */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Usage This Month</span>
                    {shouldShowWarning() && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Approaching limit</span>
                      </div>
                    )}
                    {isUsageCritical() && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Critical</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Used</span>
                      <span className="font-medium">{usageStats.used.toLocaleString()} / {usageStats.limit.toLocaleString()} characters</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isUsageCritical() ? 'bg-red-500' : shouldShowWarning() ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, usageStats.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">{usageStats.remaining.toLocaleString()} characters</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetUsage}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Usage (This Month)
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
