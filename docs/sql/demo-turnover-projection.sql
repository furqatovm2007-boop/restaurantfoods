create or replace function rf_demo_private.room(p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare a text:=coalesce(p->>'action','snapshot'); rid text:=p->>'restaurantId'; uid uuid:=auth.uid(); admin boolean:=coalesce(auth.uid()='4fcd0d25-6ec1-4e10-a15f-8005d683edfe'::uuid,false); t public.rf_demo_tables; b public.rf_demo_bookings; s timestamptz; e timestamptz; g int; result jsonb; enabled boolean; cfg public.rf_demo_restaurants; target text;
begin
 select ds.enabled into enabled from public.rf_demo_settings ds where id=true;
 if a='config' then return jsonb_build_object('enabled',enabled); end if;
 if a='settings' then
  if not admin then raise exception 'DEMO_FORBIDDEN'; end if;
  update public.rf_demo_settings set enabled=(p->>'enabled')::boolean where id=true;
  update public.rf_demo_events set revision=revision+1;
  return jsonb_build_object('ok',true);
 end if;
 if not exists(select 1 from public.rf_demo_restaurants where id=rid and is_demo) then raise exception 'DEMO_NOT_FOUND'; end if;
 if not enabled and not admin then raise exception 'DEMO_DISABLED'; end if;
 select * into cfg from public.rf_demo_restaurants where id=rid;
 admin:=admin or coalesce(cfg.owner_id=uid,false);
 s:=(p->>'start')::timestamptz; e:=(p->>'end')::timestamptz; g:=coalesce((p->>'guests')::int,2);
 if s is null or e is null or e<=s or e-s<interval '30 minutes' or e-s>interval '6 hours' or s<now()-interval '1 day' or s>now()+interval '90 days' or g not between 1 and 8 then raise exception 'DEMO_INVALID_TIME'; end if;
 if (s at time zone 'Asia/Samarkand')::date<>(e at time zone 'Asia/Samarkand')::date or (s at time zone 'Asia/Samarkand')::time<time '09:00' or (e at time zone 'Asia/Samarkand')::time>time '23:00' then raise exception 'DEMO_OPENING_HOURS'; end if;
 if a='snapshot' then
  with expired as(update public.rf_demo_bookings set status='cancelled' where status='hold' and expires_at<=now() and table_id in(select id from public.rf_demo_tables where restaurant_id=rid) returning id)
  update public.rf_demo_events set revision=revision+1 where restaurant_id=rid and exists(select 1 from expired);
 end if;
 if a<>'snapshot' then
  if uid is null then raise exception 'DEMO_LOGIN_REQUIRED'; end if;
  if not exists(select 1 from auth.users where id=uid and not is_anonymous and (email_confirmed_at is not null or phone_confirmed_at is not null)) then raise exception 'DEMO_LOGIN_REQUIRED'; end if;
  -- Serialize each restaurant's state changes, including add/remove and cleanup.
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into cfg from public.rf_demo_restaurants where id=rid for update;
  if a='turnover_settings' then
   if not admin then raise exception 'DEMO_FORBIDDEN';end if;
   if p->>'buffer' is null or p->>'duration' is null or p->>'grace' is null then raise exception 'DEMO_INVALID_TIME';end if;
   update public.rf_demo_restaurants set cleaning_buffer_minutes=(p->>'buffer')::int,booking_duration_minutes=(p->>'duration')::int,grace_period_minutes=(p->>'grace')::int where id=rid;
  elsif a='sample' then
   if not admin then raise exception 'DEMO_FORBIDDEN'; end if;
   -- Preserve customer demo reservations. Populate only currently empty slots.
   insert into public.rf_demo_bookings(table_id,starts_at,ends_at,guests,status,expires_at,cleaning_buffer_minutes)
   select dt.id,s,e,2,case when dt.number in(2,6) then 'occupied' when dt.number in(3,8) then 'hold' else 'confirmed' end,case when dt.number in(3,8) then now()+interval '5 minutes' end,cfg.cleaning_buffer_minutes
   from public.rf_demo_tables dt where dt.restaurant_id=rid and dt.active and dt.number in(2,3,4,6,8) and not exists(select 1 from public.rf_demo_bookings db where db.table_id=dt.id and db.status<>'cancelled' and (db.status<>'hold' or db.expires_at>now()) and db.starts_at<e+make_interval(mins=>cfg.cleaning_buffer_minutes) and rf_demo_private.block_end(db)>s);
  elsif a='cleanup' then
   if not admin or p->>'confirm'<>'DELETE DEMO BOOKINGS' then raise exception 'DEMO_FORBIDDEN'; end if;
   delete from public.rf_demo_bookings where is_demo and table_id in(select id from public.rf_demo_tables where restaurant_id=rid and is_demo);
  elsif a='table' then
   if not admin then raise exception 'DEMO_FORBIDDEN'; end if;
   if p->>'tableId' is not null then
    select * into t from public.rf_demo_tables where id=(p->>'tableId')::uuid and restaurant_id=rid for update;
    if not found then raise exception 'DEMO_NOT_FOUND'; end if;
    if exists(select 1 from public.rf_demo_bookings where table_id=t.id and status not in('cancelled','no_show') and rf_demo_private.block_end(rf_demo_bookings)>now()) then raise exception 'DEMO_TABLE_HAS_BOOKINGS'; end if;
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
    if exists(select 1 from public.rf_demo_bookings where table_id=t.id and status not in('cancelled','no_show') and starts_at<e+make_interval(mins=>cfg.cleaning_buffer_minutes) and rf_demo_private.block_end(rf_demo_bookings)>s) then raise exception 'DEMO_CONFLICT'; end if;
    if (select count(*) from public.rf_demo_bookings where user_id=uid and status='hold' and expires_at>now())>=3 then raise exception 'DEMO_LIMIT'; end if;
    insert into public.rf_demo_bookings(table_id,user_id,starts_at,ends_at,guests,status,expires_at,cleaning_buffer_minutes) values(t.id,uid,s,e,g,case a when 'hold' then 'hold' when 'occupy' then 'occupied' else 'confirmed' end,case when a='hold' then now()+interval '5 minutes' end,cfg.cleaning_buffer_minutes) returning * into b;
    result:=jsonb_build_object('bookingId',b.id,'expires_at',b.expires_at);
   elsif a in('confirm','cancel') then
    select * into b from public.rf_demo_bookings where id=(p->>'bookingId')::uuid and table_id=t.id for update;
    if not found or (b.user_id is distinct from uid and not admin) then raise exception 'DEMO_FORBIDDEN'; end if;
    if a='cancel' and b.status not in('hold','confirmed') then raise exception 'DEMO_INVALID_TRANSITION';end if;
    if a='confirm' and (b.status<>'hold' or b.expires_at<=now()) then raise exception 'DEMO_EXPIRED'; end if;
    if a='confirm' and exists(select 1 from public.rf_demo_bookings x where x.table_id=t.id and x.id<>b.id and x.starts_at<b.ends_at+make_interval(mins=>b.cleaning_buffer_minutes) and rf_demo_private.block_end(x)>b.starts_at) then raise exception 'DEMO_CONFLICT';end if;
    update public.rf_demo_bookings set status=case a when 'confirm' then 'confirmed' else 'cancelled' end where id=b.id;
   elsif a in('transition','free') then
    if not admin then raise exception 'DEMO_FORBIDDEN';end if;
    select * into b from public.rf_demo_bookings where id=(p->>'bookingId')::uuid and table_id=t.id for update;
    if not found then raise exception 'DEMO_NOT_FOUND';end if;
    target:=case when a='free' then 'available' else p->>'status' end;
    if not ((b.status='confirmed' and target in('checked_in','no_show','cancelled')) or
      (b.status='checked_in' and target in('seated','completed','cleaning')) or
      (b.status in('seated','occupied') and target in('completed','cleaning')) or
      (b.status='completed' and target in('cleaning','available')) or
      (b.status='cleaning' and target='available')) then raise exception 'DEMO_INVALID_TRANSITION';end if;
    if target='no_show' and now()<b.starts_at+make_interval(mins=>cfg.grace_period_minutes) then raise exception 'DEMO_GRACE_PERIOD';end if;
    if target='checked_in' and now()<b.starts_at-make_interval(mins=>cfg.grace_period_minutes) then raise exception 'DEMO_TOO_EARLY';end if;
    update public.rf_demo_bookings set status=target,
      checked_in_at=case when target='checked_in' then now() else checked_in_at end,
      seated_at=case when target='seated' then now() else seated_at end,
      actual_end_at=case when target in('completed','cleaning') then coalesce(actual_end_at,now()) else actual_end_at end,
      ready_at=case when target='available' then now() else ready_at end where id=b.id;
   else raise exception 'DEMO_INVALID_ACTION'; end if;
  end if;
  update public.rf_demo_events set revision=revision+1 where restaurant_id=rid;
  return coalesce(result,'{}'::jsonb)||jsonb_build_object('ok',true,'server_now',now());
 end if;
 select jsonb_agg(to_jsonb(q)) into result from (
 select dt.*,
 case when not dt.active then 'unavailable' when exists(select 1 from public.rf_demo_bookings z where z.table_id=dt.id and z.starts_at<e+make_interval(mins=>cfg.cleaning_buffer_minutes) and rf_demo_private.block_end(z)>s) then
 (select case when z.status='hold' then 'hold' when z.status in('completed','cleaning') or s>=coalesce(z.actual_end_at,z.ends_at) and not (z.status in('seated','checked_in','occupied') and z.ends_at<now()) then 'cleaning' when z.status in('seated','checked_in','occupied') then 'occupied' else 'confirmed' end from public.rf_demo_bookings z where z.table_id=dt.id and z.starts_at<e+make_interval(mins=>cfg.cleaning_buffer_minutes) and rf_demo_private.block_end(z)>s order by z.starts_at limit 1)
 else 'free' end as state,
 case when dt.active then rf_demo_private.next_slot(dt.id,s,e-s,make_interval(mins=>cfg.cleaning_buffer_minutes)) end as next_available_time,
 coalesce((select jsonb_agg(jsonb_build_object('id',case when db.user_id=uid or admin then db.id end,'mine',coalesce(db.user_id=uid,false),'status',db.status,'start',db.starts_at,'end',db.ends_at,'cleaning_start',coalesce(db.actual_end_at,db.ends_at),'cleaning_end',coalesce(db.actual_end_at,db.ends_at)+make_interval(mins=>db.cleaning_buffer_minutes),'ready_at',db.ready_at,'expires_at',db.expires_at) order by db.starts_at) from public.rf_demo_bookings db where db.table_id=dt.id and db.starts_at<e+make_interval(mins=>cfg.cleaning_buffer_minutes) and rf_demo_private.block_end(db)>s),'[]'::jsonb) reservations,
 case when admin then coalesce((select jsonb_agg(jsonb_build_object('id',db.id,'status',db.status,'start',db.starts_at,'end',db.ends_at,'cleaning_end',coalesce(db.actual_end_at,db.ends_at)+make_interval(mins=>db.cleaning_buffer_minutes),'overdue',db.status in('occupied','checked_in','seated') and db.ends_at<now(),'grace_exceeded',db.status='confirmed' and now()>db.starts_at+make_interval(mins=>cfg.grace_period_minutes)) order by db.starts_at) from public.rf_demo_bookings db where db.table_id=dt.id and ((db.starts_at at time zone 'Asia/Samarkand')::date=(s at time zone 'Asia/Samarkand')::date or (db.status in('seated','occupied','checked_in','cleaning','completed') and rf_demo_private.block_end(db)>now())) and db.status<>'hold'),'[]'::jsonb) else '[]'::jsonb end as schedule
 from public.rf_demo_tables dt where dt.restaurant_id=rid order by dt.floor,dt.number) q;
 return jsonb_build_object('tables',coalesce(result,'[]'::jsonb),'server_now',now(),'admin',admin,'enabled',enabled,'is_demo',true,'cleaning_buffer_minutes',cfg.cleaning_buffer_minutes,'booking_duration_minutes',cfg.booking_duration_minutes,'grace_period_minutes',cfg.grace_period_minutes);
end $$;
