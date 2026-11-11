-- Pathora: Stage 8 database setup (CV tailoring).
-- Paste into Supabase: SQL Editor > New query > Run. Safe to run more than once.

alter table public.cvs
  add column if not exists job_analysis_id uuid references public.job_analyses (id) on delete set null,
  add column if not exists based_on_cv_id uuid references public.cvs (id) on delete set null;
