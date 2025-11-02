import { supabase } from "@/integrations/supabase/client";

export const resetUserSchedule = async () => {
  const { data, error } = await supabase.functions.invoke('reset-user-schedule', {
    body: {},
  });

  if (error) throw error;
  return data;
};
