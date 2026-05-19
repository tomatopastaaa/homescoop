-- ============================================
-- HomeScoop Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Markets (sg, my, hk etc)
create table markets (
  id text primary key,
  name text not null,
  name_zh text,
  active boolean default true
);
insert into markets values ('sg', 'Singapore', '新加坡', true);

-- Firms
create table firms (
  id uuid primary key default gen_random_uuid(),
  market_id text references markets(id) default 'sg',
  name text not null,
  name_zh text,
  subtitle text,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  verdict text check (verdict in ('good','bad','mixed')) default 'mixed',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Designers (Individual IDs)
create table designers (
  id uuid primary key default gen_random_uuid(),
  market_id text references markets(id) default 'sg',
  name text not null,
  name_zh text,
  verdict text check (verdict in ('good','bad','mixed')) default 'mixed',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Designer firm history (tracks movement between firms)
create table designer_firm_history (
  id uuid primary key default gen_random_uuid(),
  designer_id uuid references designers(id) on delete cascade,
  firm_id uuid references firms(id) on delete cascade,
  firm_name text not null,
  period text,
  is_current boolean default false,
  created_at timestamptz default now()
);

-- Contractors
create table contractors (
  id uuid primary key default gen_random_uuid(),
  market_id text references markets(id) default 'sg',
  name text not null,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now()
);

-- Reviews (community + external)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  market_id text references markets(id) default 'sg',
  firm_id uuid references firms(id) on delete cascade,
  designer_id uuid references designers(id) on delete cascade,
  contractor_id uuid references contractors(id),

  -- Author
  author_id uuid references auth.users(id),
  author_name text,
  author_email text,
  account_created_at timestamptz,

  -- Type and status
  review_type text check (review_type in ('community','external')) default 'community',
  status text check (status in ('pending','approved','rejected')) default 'approved',

  -- For external reviews
  source_url text,
  source_label text,
  external_author text,

  -- Core fields
  overall_rating integer check (overall_rating between 1 and 5),
  verdict text check (verdict in ('good','bad','mixed')),
  tags text[] default '{}',

  -- Planning stage
  p_quote text,
  p_expect text,
  p_comms text,
  p_specs text,
  p_notes text,

  -- Execution stage
  e_visits text,
  e_pm text,
  e_issues text,
  e_vo text,
  e_cost text,
  e_work text,
  e_defects text,
  e_vs text,
  e_again text,
  e_notes text,

  -- Contractor fields
  c_name text,
  c_source text,
  c_rating integer check (c_rating between 1 and 5),
  c_exp text,
  c_notes text,

  -- Engagement
  helpful_count integer default 0,
  flag_count integer default 0,

  -- Admin notes
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- One community review per user per entity
  constraint one_review_per_user_per_firm unique (author_id, firm_id),
  constraint one_review_per_user_per_designer unique (author_id, designer_id)
);

-- Helpful votes (to prevent double voting)
create table helpful_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (review_id, user_id)
);

-- Flags
create table flags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz default now(),
  unique (review_id, user_id)
);

-- Admin inbox (external content caught by monitoring)
create table admin_inbox (
  id uuid primary key default gen_random_uuid(),
  market_id text references markets(id) default 'sg',
  source_url text not null,
  source_label text,
  title text,
  snippet text,
  suggested_firm_id uuid references firms(id),
  suggested_designer_id uuid references designers(id),
  suggested_firm_name text,
  suggested_designer_name text,
  status text check (status in ('pending','approved','discarded','flagged')) default 'pending',
  admin_notes text,
  created_at timestamptz default now(),
  processed_at timestamptz
);

-- ============================================
-- Row Level Security
-- ============================================

alter table firms enable row level security;
alter table designers enable row level security;
alter table reviews enable row level security;
alter table helpful_votes enable row level security;
alter table flags enable row level security;
alter table admin_inbox enable row level security;

-- Public read access
create policy "Public read firms" on firms for select using (true);
create policy "Public read designers" on designers for select using (true);
create policy "Public read approved reviews" on reviews for select using (status = 'approved');
create policy "Public read markets" on markets for select using (true);
create policy "Public read firm history" on designer_firm_history for select using (true);
create policy "Public read contractors" on contractors for select using (true);

-- Authenticated users can insert community reviews
create policy "Auth users insert reviews" on reviews for insert
  with check (auth.uid() = author_id and review_type = 'community');

-- Users can update their own reviews
create policy "Auth users update own reviews" on reviews for update
  using (auth.uid() = author_id);

-- Helpful votes
create policy "Auth users insert votes" on helpful_votes for insert
  with check (auth.uid() = user_id);
create policy "Auth users read votes" on helpful_votes for select using (true);

-- Flags
create policy "Auth users insert flags" on flags for insert
  with check (auth.uid() = user_id);

-- Admin inbox — only accessible via service role (admin API)
create policy "No public access inbox" on admin_inbox for select using (false);

-- ============================================
-- Functions
-- ============================================

-- Auto-update firm rating when review added
create or replace function update_firm_rating()
returns trigger as $$
begin
  update firms set
    rating = (select avg(overall_rating) from reviews where firm_id = NEW.firm_id and status = 'approved'),
    review_count = (select count(*) from reviews where firm_id = NEW.firm_id and status = 'approved'),
    verdict = case
      when (select avg(overall_rating) from reviews where firm_id = NEW.firm_id and status = 'approved') >= 4 then 'good'
      when (select avg(overall_rating) from reviews where firm_id = NEW.firm_id and status = 'approved') <= 2 then 'bad'
      else 'mixed'
    end,
    updated_at = now()
  where id = NEW.firm_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_review_upsert
  after insert or update on reviews
  for each row execute function update_firm_rating();

-- Auto-flag review if flag count hits 3
create or replace function check_flag_count()
returns trigger as $$
begin
  update reviews set flag_count = flag_count + 1
  where id = NEW.review_id;

  if (select flag_count from reviews where id = NEW.review_id) >= 3 then
    update reviews set status = 'pending' where id = NEW.review_id;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger on_flag_insert
  after insert on flags
  for each row execute function check_flag_count();
