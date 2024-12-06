alter table Users enable row level security;
create policy "Can view own user data." on Users for select using (auth.uid() = id);
create policy "Can update own user data." on Users for update using (auth.uid() = id);

/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.Users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.Users
  for each row execute procedure public.handle_new_user();