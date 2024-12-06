-- Reset permissions
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Create users table if it doesn't exist
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  expo_push_token text,
  is_push_notification boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create updated_at trigger on users table
drop trigger if exists on_users_updated on users;
create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- Enable RLS
alter table public.users enable row level security;

-- Grant basic permissions
grant usage on schema public to anon, authenticated;
grant all privileges on public.users to authenticated;
grant all privileges on all sequences in schema public to authenticated;

-- Create policies
drop policy if exists "Users can view their own data" on public.users;
create policy "Users can view their own data"
  on public.users for select
  to authenticated
  using ( auth.uid() = id );

drop policy if exists "Users can update their own data" on public.users;
create policy "Users can update their own data"
  on public.users for update
  to authenticated
  using ( auth.uid() = id );

drop policy if exists "Users can insert their own data" on public.users;
create policy "Users can insert their own data"
  on public.users for insert
  to authenticated
  with check ( auth.uid() = id );

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Grant execute permission on the function
grant execute on function public.handle_new_user() to authenticated;
grant execute on function public.handle_updated_at() to authenticated;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 