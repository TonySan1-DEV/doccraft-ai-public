
-- Enable RLS
alter table profiles enable row level security;
alter table documents enable row level security;
alter table enhancements enable row level security;
alter table images enable row level security;
alter table exports enable row level security;
alter table user_settings enable row level security;

-- Policies

-- profiles
create policy "Users can manage their profile"
on profiles for all
using (id = auth.uid());

-- documents
create policy "Users can manage their documents"
on documents for all
using (user_id = auth.uid());

-- enhancements
create policy "Users can manage enhancements on their docs"
on enhancements for all
using (
  document_id in (select id from documents where user_id = auth.uid())
);

-- images
create policy "Users can manage images linked to their enhancements"
on images for all
using (
  enhancement_id in (
    select id from enhancements
    where document_id in (select id from documents where user_id = auth.uid())
  )
);

-- exports
create policy "Users can access their exports"
on exports for all
using (
  document_id in (select id from documents where user_id = auth.uid())
);

-- user_settings
create policy "Users can manage their settings"
on user_settings for all
using (user_id = auth.uid());
