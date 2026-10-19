create or replace function rf_demo_private.next_slot(tid uuid,s timestamptz,duration interval,buffer interval) returns timestamptz language plpgsql stable set search_path='' as $$
declare candidate timestamptz:=s; row record;
begin
 for row in select b.starts_at,rf_demo_private.block_end(b) as until from public.rf_demo_bookings b where b.table_id=tid and b.status not in ('cancelled','no_show') and rf_demo_private.block_end(b)>s order by b.starts_at loop
  if candidate+duration+buffer<=row.starts_at then exit;end if;
  if candidate<row.until and candidate+duration+buffer>row.starts_at then candidate:=row.until;end if;
 end loop;
 if candidate='infinity'::timestamptz then return null;end if;
 if (candidate at time zone 'Asia/Samarkand')::date<>(s at time zone 'Asia/Samarkand')::date or ((candidate+duration) at time zone 'Asia/Samarkand')::time>time '23:00' then return null;end if;
 return candidate;
end $$;
