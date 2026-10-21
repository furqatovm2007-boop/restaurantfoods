begin;
do $$
declare p jsonb; result jsonb; tid uuid; bid uuid; nonadmin uuid; denied boolean; s timestamptz:=((now() at time zone 'Asia/Samarkand')::date+70+time '13:00') at time zone 'Asia/Samarkand';
begin
 perform set_config('request.jwt.claim.sub','4fcd0d25-6ec1-4e10-a15f-8005d683edfe',true);
 select id into tid from public.rf_demo_tables where restaurant_id='rf-demo-restaurant-01' and number=1;
 p:=jsonb_build_object('restaurantId','rf-demo-restaurant-01','tableId',tid,'start',s,'end',s+interval '2 hours','guests',2);
 result:=public.rf_demo_room(p||'{"action":"hold"}');bid:=(result->>'bookingId')::uuid;
 if abs(extract(epoch from ((result->>'expires_at')::timestamptz-now()))-300)>1 then raise exception 'TTL failed';end if;
 denied:=false;begin perform public.rf_demo_room(p||'{"action":"hold"}');exception when others then if sqlerrm='DEMO_CONFLICT' then denied:=true;else raise;end if;end;if not denied then raise exception 'overlap accepted';end if;
 perform public.rf_demo_room(p||jsonb_build_object('action','confirm','bookingId',bid));
 if (select status from public.rf_demo_bookings where id=bid)<>'confirmed' then raise exception 'confirm failed';end if;
 perform public.rf_demo_room(p||jsonb_build_object('action','cancel','bookingId',bid));
 result:=public.rf_demo_room(p||'{"action":"hold"}');bid:=(result->>'bookingId')::uuid;
 update public.rf_demo_bookings set expires_at=now()-interval '1 second' where id=bid;
 denied:=false;begin perform public.rf_demo_room(p||jsonb_build_object('action','confirm','bookingId',bid));exception when others then if sqlerrm='DEMO_EXPIRED' then denied:=true;else raise;end if;end;if not denied then raise exception 'expired accepted';end if;
 result:=public.rf_demo_room(p||'{"action":"snapshot"}');
 if (select status from public.rf_demo_bookings where id=bid)<>'cancelled' then raise exception 'expiry cancellation failed';end if;
 select id into nonadmin from auth.users where id<>'4fcd0d25-6ec1-4e10-a15f-8005d683edfe' and email_confirmed_at is not null limit 1;
 perform set_config('request.jwt.claim.sub',nonadmin::text,true);
 result:=public.rf_demo_room(p||'{"action":"hold"}');bid:=(result->>'bookingId')::uuid;
 denied:=false;begin perform public.rf_demo_room(p||'{"action":"free"}');exception when others then if sqlerrm='DEMO_FORBIDDEN' then denied:=true;else raise;end if;end;if not denied then raise exception 'nonadmin privilege escalation';end if;
 perform public.rf_demo_room(p||jsonb_build_object('action','confirm','bookingId',bid));
 -- Adjacent reservation is allowed, same interval is not.
 result:=public.rf_demo_room(p||jsonb_build_object('action','hold','start',s+interval '2 hours','end',s+interval '3 hours'));
 perform set_config('request.jwt.claim.sub','',true);
 result:=public.rf_demo_room(p||'{"action":"snapshot"}');
 if result::text like '%'||bid::text||'%' then raise exception 'booking id privacy leak';end if;
 denied:=false;begin perform public.rf_demo_room(p||'{"action":"hold"}');exception when others then if sqlerrm='DEMO_LOGIN_REQUIRED' then denied:=true;else raise;end if;end;if not denied then raise exception 'anonymous mutation';end if;
 perform set_config('request.jwt.claim.sub','4fcd0d25-6ec1-4e10-a15f-8005d683edfe',true);
 perform public.rf_demo_room(p||'{"action":"sample"}');
 perform public.rf_demo_room('{"action":"settings","enabled":false}');
 perform set_config('request.jwt.claim.sub',nonadmin::text,true);
 denied:=false;begin perform public.rf_demo_room(p||'{"action":"snapshot"}');exception when others then if sqlerrm='DEMO_DISABLED' then denied:=true;else raise;end if;end;if not denied then raise exception 'disabled accessible';end if;
end $$;
rollback;
select 'PASS: 5-minute TTL, overlap, confirmation, cancellation, expiry, anonymous privacy, authenticated customer, admin restrictions, adjacent slots, demo off; test changes rolled back' as result;
