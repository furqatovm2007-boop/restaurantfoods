create policy demo_restaurants_no_direct_access on public.rf_demo_restaurants for all to anon,authenticated using(false) with check(false);
create policy demo_tables_no_direct_access on public.rf_demo_tables for all to anon,authenticated using(false) with check(false);
create policy demo_settings_no_direct_access on public.rf_demo_settings for all to anon,authenticated using(false) with check(false);
