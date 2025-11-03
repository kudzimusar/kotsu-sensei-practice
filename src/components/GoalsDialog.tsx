import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGoals, updateGoals } from "@/lib/supabase/goals";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface GoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalsDialog({ open, onOpenChange }: GoalsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [dailyTarget, setDailyTarget] = useState(10);
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [prepDays, setPrepDays] = useState(30);

  const { data: goals } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: () => getGoals(user!.id),
    enabled: !!user && open,
  });

  useEffect(() => {
    if (goals) {
      setDailyTarget(goals.daily_questions_target);
      setWeeklyHours(goals.weekly_study_hours_target);
      setPrepDays(goals.exam_prep_days);
    }
  }, [goals]);

  const updateMutation = useMutation({
    mutationFn: () => updateGoals(user!.id, {
      daily_questions_target: dailyTarget,
      weekly_study_hours_target: weeklyHours,
      exam_prep_days: prepDays,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
      toast({
        title: t('goals.updated', 'Goals updated'),
        description: t('goals.updated', 'Your study goals have been saved.'),
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: t('error.generic', 'Error'),
        description: t('error.generic', 'Failed to update goals.'),
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('goals.title', 'Study Goals')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="daily">{t('goals.daily_questions', 'Daily Questions Target')}</Label>
            <Input
              id="daily"
              type="number"
              min="1"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weekly">{t('goals.weekly_hours', 'Weekly Study Hours')}</Label>
            <Input
              id="weekly"
              type="number"
              min="1"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prep">{t('goals.exam_prep_days', 'Exam Preparation Days')}</Label>
            <Input
              id="prep"
              type="number"
              min="1"
              value={prepDays}
              onChange={(e) => setPrepDays(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <Button 
            onClick={() => updateMutation.mutate()} 
            className="w-full"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? t('common.loading', 'Saving...') : t('goals.update', 'Save Goals')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
