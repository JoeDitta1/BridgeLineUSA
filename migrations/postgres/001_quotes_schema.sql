-- Supabase/Postgres migration: quotes, revisions, files, sequencer, trigger

-- 1) Quotes (authoritative metadata)
create table if not exists public.quotes (
  id bigserial primary key,
  quote_no bigint unique,
  customer text not null,
  project text,
  status text not null default 'draft',
  version_current int not null default 1,
  qc jsonb,
  totals jsonb,
  storage_key_root text not null,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quotes_customer on public.quotes (customer);
create index if not exists idx_quotes_status   on public.quotes (status);
create index if not exists idx_quotes_updated  on public.quotes (updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_quotes_updated on public.quotes;
create trigger trg_quotes_updated
before update on public.quotes
for each row execute procedure public.set_updated_at();

create table if not exists public.quote_numbers (
  id int primary key default 1,
  next_no bigint not null
);
insert into public.quote_numbers (id, next_no)
  values (1, 1000) on conflict (id) do nothing;

-- 2) Revisions
create table if not exists public.quote_revisions (
  id bigserial primary key,
  quote_id bigint not null references public.quotes(id) on delete cascade,
  version int not null,
  label text,
  snapshot jsonb,
  storage_key_json text not null,
  storage_key_pdf text,
  created_by text,
  created_at timestamptz not null default now(),
  unique (quote_id, version)
);

-- 3) Files
create table if not exists public.quote_files (
  id bigserial primary key,
  quote_id bigint not null references public.quotes(id) on delete cascade,
  kind text not null,
  name text not null,
  size bigint,
  content_type text,
  storage_key text not null,
  public_url text,
  created_at timestamptz not null default now()
);

create or replace function public.allocate_quote_no()
returns bigint language plpgsql as $$
declare
  v_next bigint;
begin
  update public.quote_numbers
     set next_no = next_no + 1
   where id = 1
   returning next_no - 1 into v_next;
  return v_next;
end $$;
