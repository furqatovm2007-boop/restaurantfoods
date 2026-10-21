-- Isolated demo system. No writes to real RestaurantFoods D1 data.
create schema if not exists rf_demo_private;
revoke all on schema rf_demo_private from public;
grant usage on schema rf_demo_private to anon, authenticated;
create table public.rf_demo_settings(id boolean primary key default true check(id), enabled boolean not null default true);
insert into public.rf_demo_settings values(true,true);
create table public.rf_demo_restaurants(id text primary key check(id ~ '^rf-demo-restaurant-[0-9]{2}$'), is_demo boolean not null default true check(is_demo));
create table public.rf_demo_tables(id uuid primary key default gen_random_uuid(), restaurant_id text not null references public.rf_demo_restaurants(id) on delete cascade, number int not null check(number between 1 and 100), floor int not null check(floor between 1 and 10), seats int not null check(seats in (2,4,6,8)), shape text not null check(shape in ('round','square','rectangle')), x int not null check(x between 10 and 90), y int not null check(y between 15 and 85), active boolean not null default true, is_demo boolean not null default true check(is_demo), unique(restaurant_id,number));
create table public.rf_demo_bookings(id uuid primary key default gen_random_uuid(), table_id uuid not null references public.rf_demo_tables(id) on delete cascade, user_id uuid, starts_at timestamptz not null, ends_at timestamptz not null, guests int not null check(guests between 1 and 8), status text not null check(status in ('hold','confirmed','occupied','cancelled')), expires_at timestamptz, is_demo boolean not null default true check(is_demo), created_at timestamptz not null default now(), check(ends_at>starts_at), check(status<>'hold' or expires_at is not null));
create index rf_demo_booking_overlap on public.rf_demo_bookings(table_id,starts_at,ends_at) where status<>'cancelled';
create index rf_demo_booking_user on public.rf_demo_bookings(user_id);
create table public.rf_demo_events(restaurant_id text primary key references public.rf_demo_restaurants(id) on delete cascade, revision bigint not null default 1);
alter table public.rf_demo_settings enable row level security;
alter table public.rf_demo_restaurants enable row level security;
alter table public.rf_demo_tables enable row level security;
alter table public.rf_demo_bookings enable row level security;
alter table public.rf_demo_events enable row level security;
revoke all on public.rf_demo_settings,public.rf_demo_restaurants,public.rf_demo_tables,public.rf_demo_bookings,public.rf_demo_events from anon,authenticated;
grant select on public.rf_demo_events to anon,authenticated;
create policy demo_event_read on public.rf_demo_events for select to anon,authenticated using(true);
grant select on public.rf_demo_bookings to authenticated;
create policy own_demo_bookings on public.rf_demo_bookings for select to authenticated using(user_id=(select auth.uid()));
insert into public.rf_demo_restaurants select 'rf-demo-restaurant-'||lpad(n::text,2,'0'),true from generate_series(1,10) n;
insert into public.rf_demo_events(restaurant_id) select id from public.rf_demo_restaurants;
insert into public.rf_demo_tables(restaurant_id,number,floor,seats,shape,x,y,active)
select r.id,n,case when n<=4 then 1 else 2 end,(array[2,4,6,8])[1+(n-1)%4],(array['round','square','rectangle','rectangle'])[1+(n-1)%4],case when n%2=1 then 28 else 72 end,case when (n-1)%4<2 then 32 else 72 end,n<>9 from public.rf_demo_restaurants r cross join generate_series(1,9) n;
-- Seed tomorrow's demo lunch; never pretend these are real guests.
insert into public.rf_demo_bookings(table_id,starts_at,ends_at,guests,status,expires_at)
select id,((now() at time zone 'Asia/Samarkand')::date+1+time '13:00') at time zone 'Asia/Samarkand',((now() at time zone 'Asia/Samarkand')::date+1+time '15:00') at time zone 'Asia/Samarkand',2,case when number in(2,6) then 'occupied' when number in(3,8) then 'hold' else 'confirmed' end,case when number in(3,8) then now()+interval '5 minutes' end from public.rf_demo_tables where number in(2,3,4,6,8);
-- A public invoker wrapper exposes only this audited contract. Private definer
-- holds locks and returns availability, never other customers' identifiers.
create function rf_demo_private.room(p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare a text:=coalesce(p->>'action','snapshot'); rid text:=p->>'restaurantId'; uid uuid:=auth.uid(); admin boolean:=coalesce(auth.uid()='4fcd0d25-6ec1-4e10-a15f-8005d683edfe'::uuid,false); t public.rf_demo_tables; b public.rf_demo_bookings; s timestamptz; e timestamptz; g int; result jsonb; enabled boolean;
begin
 select ds.enabled into enabled from public.rf_demo_settings ds where id=true;
 if a='settings' then
  if not admin then raise exception 'DEMO_FORBIDDEN'; end if;
  update public.rf_demo_settings set enabled=(p->>'enabled')::boolean where id=true;
  update public.rf_demo_events set revision=revision+1;
  return jsonb_build_object('ok',true);
 end if;
 if not exists(select 1 from public.rf_demo_restaurants where id=rid and is_demo) then raise exception 'DEMO_NOT_FOUND'; end if;
 if not enabled and not admin then raise exception 'DEMO_DISABLED'; end if;
 s:=(p->>'start')::timestamptz; e:=(p->>'end')::timestamptz; g:=coalesce((p->>'guests')::int,2);
 if s is null or e is null or e<=s or e-s<interval '30 minutes' or e-s>interval '6 hours' or s<now()-interval '1 day' or s>now()+interval '90 days' or g not between 1 and 8 then raise exception 'DEMO_INVALID_TIME'; end if;
 if (s at time zone 'Asia/Samarkand')::date<>(e at time zone 'Asia/Samarkand')::date or (s at time zone 'Asia/Samarkand')::time<time '09:00' or (e at time zone 'Asia/Samarkand')::time>time '23:00' then raise exception 'DEMO_OPENING_HOURS'; end if;
 if a<>'snapshot' then
  if uid is null then raise exception 'DEMO_LOGIN_REQUIRED'; end if;
  if not exists(select 1 from auth.users where id=uid and not is_anonymous and (email_confirmed_at is not null or phone_confirmed_at is not null)) then raise exception 'DEMO_LOGIN_REQUIRED'; end if;
  -- Serialize each restaurant's state changes, including add/remove and cleanup.
  perform 1 from public.rf_demo_restaurants where id=rid for update;
  if a='cleanup' then
   if not admin or p->>'confirm'<>'DELETE DEMO BOOKINGS' then raise exception 'DEMO_FORBIDDEN'; end if;
   delete from public.rf_demo_bookings where is_demo and table_id in(select id from public.rf_demo_tables where restaurant_id=rid and is_demo);
  elsif a='table' then
   if not admin then raise exception 'DEMO_FORBIDDEN'; end if;
   if p->>'tableId' is not null then
    select * into t from public.rf_demo_tables where id=(p->>'tableId')::uuid and restaurant_id=rid for update;
    if not found then raise exception 'DEMO_NOT_FOUND'; end if;
    if exists(select 1 from public.rf_demo_bookings where table_id=t.id and status<>'cancelled' and ends_at>now() and (status<>'hold' or expires_at>now())) then raise exception 'DEMO_TABLE_HAS_BOOKINGS'; end if;
    if coalesce((p->>'remove')::boolean,false) then delete from public.rf_demo_tables where id=t.id;
    else update public.rf_demo_tables set number=(p->>'number')::int,floor=(p->>'floor')::int,seats=(p->>'seats')::int,shape=p->>'shape',x=(p->>'x')::int,y=(p->>'y')::int,active=(p->>'active')::boolean where id=t.id; end if;
   else
    if (select count(*) from public.rf_demo_tables where restaurant_id=rid)>=50 then raise exception 'DEMO_LIMIT'; end if;
    insert into public.rf_demo_tables(restaurant_id,number,floor,seats,shape,x,y,active) values(rid,(p->>'number')::int,(p->>'floor')::int,(p->>'seats')::int,p->>'shape',(p->>'x')::int,(p->>'y')::int,(p->>'active')::boolean);
   end if;
  else
   select * into t from public.rf_demo_tables where id=(p->>'tableId')::uuid and restaurant_id=rid for update;
   if not found then raise exception 'DEMO_NOT_FOUND'; end if;
   update public.rf_demo_bookings set status='cancelled' where table_id=t.id and status='hold' and expires_at<=now();
   if a in('hold','occupy','reserve') then
    if a<>'hold' and not admin then raise exception 'DEMO_FORBIDDEN'; end if;
    if s<now() or not t.active or g>t.seats then raise exception 'DEMO_UNAVAILABLE'; end if;
    -- Transaction lock + overlap check is atomic; adjacent intervals are allowed.
    if exists(select 1 from public.rf_demo_bookings where table_id=t.id and status in('hold','confirmed','occupied') and (status<>'hold' or expires_at>now()) and starts_at<e and ends_at>s) then raise exception 'DEMO_CONFLICT'; end if;
    if (select count(*) from public.rf_demo_bookings where user_id=uid and status='hold' and expires_at>now())>=3 then raise exception 'DEMO_LIMIT'; end if;
    insert into public.rf_demo_bookings(table_id,user_id,starts_at,ends_at,guests,status,expires_at) values(t.id,uid,s,e,g,case a when 'hold' then 'hold' when 'occupy' then 'occupied' else 'confirmed' end,case when a='hold' then now()+interval '5 minutes' end) returning * into b;
    result:=jsonb_build_object('bookingId',b.id,'expires_at',b.expires_at);
   elsif a in('confirm','cancel') then
    select * into b from public.rf_demo_bookings where id=(p->>'bookingId')::uuid and table_id=t.id for update;
    if not found or (b.user_id is distinct from uid and not admin) then raise exception 'DEMO_FORBIDDEN'; end if;
    if a='confirm' and (b.status<>'hold' or b.expires_at<=now()) then raise exception 'DEMO_EXPIRED'; end if;
    update public.rf_demo_bookings set status=case a when 'confirm' then 'confirmed' else 'cancelled' end where id=b.id;
   elsif a='free' then
    if not admin then raise exception 'DEMO_FORBIDDEN'; end if;
    update public.rf_demo_bookings set status='cancelled' where table_id=t.id and starts_at<e and ends_at>s;
   else raise exception 'DEMO_INVALID_ACTION'; end if;
  end if;
  update public.rf_demo_events set revision=revision+1 where restaurant_id=rid;
  return coalesce(result,'{}'::jsonb)||jsonb_build_object('ok',true,'server_now',now());
 end if;
 select jsonb_agg(to_jsonb(q)) into result from (
 select dt.*,coalesce((select jsonb_agg(jsonb_build_object('id',case when db.user_id=uid or admin then db.id end,'mine',coalesce(db.user_id=uid,false),'status',db.status,'start',db.starts_at,'end',db.ends_at,'expires_at',db.expires_at)) from public.rf_demo_bookings db where db.table_id=dt.id and db.status in('hold','confirmed','occupied') and (db.status<>'hold' or db.expires_at>now()) and db.starts_at<e and db.ends_at>s),'[]'::jsonb) reservations from public.rf_demo_tables dt where dt.restaurant_id=rid order by dt.floor,dt.number) q;
 return jsonb_build_object('tables',coalesce(result,'[]'::jsonb),'server_now',now(),'admin',admin,'enabled',enabled,'is_demo',true);
end $$;
revoke all on function rf_demo_private.room(jsonb) from public;
grant execute on function rf_demo_private.room(jsonb) to anon,authenticated;
create function public.rf_demo_room(p jsonb) returns jsonb language sql security invoker set search_path='' as $$select rf_demo_private.room(p)$$;
revoke all on function public.rf_demo_room(jsonb) from public;
grant execute on function public.rf_demo_room(jsonb) to anon,authenticated;
alter publication supabase_realtime add table public.rf_demo_events;
