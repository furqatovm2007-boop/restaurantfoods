begin;
do $$
declare p jsonb; q jsonb; snap jsonb; item jsonb; tid uuid; bid uuid; later_id uuid; ok boolean; s timestamptz:=((now() at time zone 'Asia/Samarkand')::date+70+time '14:00') at time zone 'Asia/Samarkand';
begin
 perform set_config('request.jwt.claim.sub','4fcd0d25-6ec1-4e10-a15f-8005d683edfe',true);
 select id into tid from public.rf_demo_tables where restaurant_id='rf-demo-restaurant-01' and number=1;
 p:=jsonb_build_object('restaurantId','rf-demo-restaurant-01','tableId',tid,'start',s,'end',s+interval '2 hours','guests',2);
 perform public.rf_demo_room(p||'{"action":"turnover_settings","buffer":60,"duration":120,"grace":15}');
 q:=public.rf_demo_room(p||'{"action":"reserve"}');bid:=(q->>'bookingId')::uuid;
 q:=p||jsonb_build_object('start',s+interval '2 hours 30 minutes','end',s+interval '4 hours 30 minutes');
 snap:=public.rf_demo_room(q||'{"action":"snapshot"}');select value into item from jsonb_array_elements(snap->'tables') where value->>'id'=tid::text;
 if item->>'state'<>'cleaning' or (item->>'next_available_time')::timestamptz<>s+interval '3 hours' then raise exception '16:30 cleaning / next17 failed: %',item;end if;
 ok:=false;begin perform public.rf_demo_room(q||'{"action":"hold"}');exception when others then if sqlerrm='DEMO_CONFLICT' then ok:=true;else raise;end if;end;if not ok then raise exception '16:30 accepted';end if;
 q:=p||jsonb_build_object('start',s+interval '3 hours','end',s+interval '5 hours');
 snap:=public.rf_demo_room(q||'{"action":"snapshot"}');select value into item from jsonb_array_elements(snap->'tables') where value->>'id'=tid::text;
 if item->>'state'<>'free' then raise exception '17:00 not free';end if;
 q:=public.rf_demo_room(q||'{"action":"hold"}');later_id:=(q->>'bookingId')::uuid;
 perform public.rf_demo_room(p||jsonb_build_object('action','cancel','bookingId',later_id));
 -- Incoming cleaning buffer must also respect a later reservation.
 ok:=false;begin perform public.rf_demo_room(p||jsonb_build_object('action','hold','start',s-interval '2 hours','end',s-interval '30 minutes'));exception when others then if sqlerrm='DEMO_CONFLICT' then ok:=true;else raise;end if;end;if not ok then raise exception 'incoming buffer collision accepted';end if;
 -- Confirm checks overlap again; expired holds release without waiting for a job.
 perform public.rf_demo_room(p||jsonb_build_object('action','cancel','bookingId',bid));
 q:=public.rf_demo_room(p||'{"action":"hold"}');bid:=(q->>'bookingId')::uuid;
 update public.rf_demo_bookings set expires_at=now()-interval '1 second' where id=bid;
 q:=public.rf_demo_room(p||'{"action":"hold"}');bid:=(q->>'bookingId')::uuid;
 perform public.rf_demo_room(p||jsonb_build_object('action','confirm','bookingId',bid));
 -- Early actual departure, then exact ready time, preserve scheduled end.
 update public.rf_demo_bookings set status='cleaning',actual_end_at=s+interval '90 minutes' where id=bid;
 if (select rf_demo_private.block_end(b) from public.rf_demo_bookings b where id=bid)<>s+interval '150 minutes' then raise exception 'early departure calculation';end if;
 update public.rf_demo_bookings set status='available',ready_at=s+interval '135 minutes' where id=bid;
 if (select rf_demo_private.block_end(b) from public.rf_demo_bookings b where id=bid)<>s+interval '135 minutes' then raise exception 'ready at16:15 failed';end if;
 if (select ends_at from public.rf_demo_bookings where id=bid)<>s+interval '2 hours' then raise exception 'scheduled booking changed';end if;
 -- Current service lifecycle and overstay never cancel later confirmations.
 insert into public.rf_demo_bookings(table_id,user_id,starts_at,ends_at,guests,status) values(tid,auth.uid(),now()-interval '1 hour',now()-interval '10 minutes',2,'confirmed') returning id into bid;
 perform public.rf_demo_room(p||jsonb_build_object('action','transition','bookingId',bid,'status','checked_in'));
 perform public.rf_demo_room(p||jsonb_build_object('action','transition','bookingId',bid,'status','seated'));
 if (select rf_demo_private.block_end(b) from public.rf_demo_bookings b where id=bid)<>'infinity'::timestamptz then raise exception 'overstay must block';end if;
 perform public.rf_demo_room(p||jsonb_build_object('action','transition','bookingId',bid,'status','completed'));
 perform public.rf_demo_room(p||jsonb_build_object('action','transition','bookingId',bid,'status','cleaning'));
 perform public.rf_demo_room(p||jsonb_build_object('action','transition','bookingId',bid,'status','available'));
 if (select ready_at from public.rf_demo_bookings where id=bid) is null then raise exception 'ready missing';end if;
 -- Grace period cannot be skipped.
 insert into public.rf_demo_bookings(table_id,user_id,starts_at,ends_at,guests,status) values(tid,auth.uid(),now()+interval '10 minutes',now()+interval '1 hour',2,'confirmed') returning id into bid;
 ok:=false;begin perform public.rf_demo_room(p||jsonb_build_object('action','transition','bookingId',bid,'status','no_show'));exception when others then if sqlerrm='DEMO_GRACE_PERIOD' then ok:=true;else raise;end if;end;if not ok then raise exception 'early no-show';end if;
 update public.rf_demo_bookings set starts_at=now()-interval '30 minutes' where id=bid;
 perform public.rf_demo_room(p||jsonb_build_object('action','transition','bookingId',bid,'status','no_show'));
end $$;
rollback;
select 'PASS: 14–16 +60 buffer, 16:30 blocked, 17:00 free, two-sided effective intervals, expiry, early finish, 16:15 ready, lifecycle, overstay, no-show grace; rolled back' as result;
