-- ============================================
-- DRIVING SCHOOL APP DATABASE SETUP
-- Run this script in your Supabase SQL Editor
-- ============================================

-- Create app_role enum for user roles
create type public.app_role as enum ('admin', 'moderator', 'user');

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  exam_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- USER ROLES TABLE
-- ============================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "Users can view own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Create security definer function for role checking
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- ============================================
-- QUIZ PROGRESS TABLE
-- ============================================
create table public.quiz_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  quiz_mode text not null check (quiz_mode in ('quick', 'focused', 'permit', 'license')),
  current_question_index integer not null default 0,
  score integer not null default 0,
  time_limit integer,
  selected_questions jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quiz_progress enable row level security;

create policy "Users can view own quiz progress"
  on public.quiz_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz progress"
  on public.quiz_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quiz progress"
  on public.quiz_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own quiz progress"
  on public.quiz_progress for delete
  using (auth.uid() = user_id);

-- ============================================
-- CATEGORY PERFORMANCE TABLE
-- ============================================
create table public.category_performance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  correct integer not null default 0,
  total integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, category)
);

alter table public.category_performance enable row level security;

create policy "Users can view own performance"
  on public.category_performance for select
  using (auth.uid() = user_id);

create policy "Users can insert own performance"
  on public.category_performance for insert
  with check (auth.uid() = user_id);

create policy "Users can update own performance"
  on public.category_performance for update
  using (auth.uid() = user_id);

-- ============================================
-- STUDY EVENTS TABLE (Calendar)
-- ============================================
create table public.study_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  title text not null,
  type text not null check (type in ('lesson', 'test', 'class', 'practice')),
  time text,
  description text,
  location text,
  instructor text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.study_events enable row level security;

create policy "Users can view own events"
  on public.study_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own events"
  on public.study_events for insert
  with check (auth.uid() = user_id);

create policy "Users can update own events"
  on public.study_events for update
  using (auth.uid() = user_id);

create policy "Users can delete own events"
  on public.study_events for delete
  using (auth.uid() = user_id);

-- ============================================
-- TEST HISTORY TABLE
-- ============================================
create table public.test_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  test_type text not null,
  date timestamp with time zone not null,
  passed boolean not null,
  score integer not null,
  time_taken integer not null,
  total_questions integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.test_history enable row level security;

create policy "Users can view own test history"
  on public.test_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own test history"
  on public.test_history for insert
  with check (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile and assign default role on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.quiz_progress
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.category_performance
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.study_events
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Add your Supabase URL and Anon Key to your .env file
-- 2. Update frontend code to use Supabase instead of localStorage
-- ============================================
