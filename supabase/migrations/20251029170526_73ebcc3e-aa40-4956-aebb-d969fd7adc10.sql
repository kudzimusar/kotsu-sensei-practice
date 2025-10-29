-- Allow anonymous users to create guest sessions
CREATE POLICY "Anyone can create guest sessions"
  ON public.guest_sessions
  FOR INSERT
  WITH CHECK (true);