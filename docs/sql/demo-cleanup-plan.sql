-- PREVIEW ONLY. Not executed. Review before full permanent removal.
SELECT id,name FROM restaurants WHERE is_demo=1;
SELECT restaurant_id,count(*) FROM bookings WHERE is_demo=1 GROUP BY restaurant_id;
SELECT restaurant_id,count(*) FROM orders WHERE is_demo=1 GROUP BY restaurant_id;
-- D1 removal: submit these statements together in DB.batch, after global demo disable.
-- Every predicate requires the demo flag on parent AND child. Foreign keys prevent
-- removing a restaurant referenced by an unflagged/real row; the batch rolls back.
-- DELETE FROM reviews WHERE is_demo=1 AND restaurant_id IN(SELECT id FROM restaurants WHERE is_demo=1);
-- DELETE FROM bookings WHERE is_demo=1 AND restaurant_id IN(SELECT id FROM restaurants WHERE is_demo=1);
-- DELETE FROM orders WHERE is_demo=1 AND restaurant_id IN(SELECT id FROM restaurants WHERE is_demo=1);
-- DELETE FROM menu WHERE is_demo=1 AND restaurant_id IN(SELECT id FROM restaurants WHERE is_demo=1);
-- DELETE FROM restaurant_tables WHERE is_demo=1 AND restaurant_id IN(SELECT id FROM restaurants WHERE is_demo=1);
-- DELETE FROM restaurants WHERE is_demo=1;
-- Supabase, separate reviewed transaction: child rows have CHECK(is_demo=true).
-- BEGIN;
-- DELETE FROM public.rf_demo_restaurants WHERE is_demo=true;
-- COMMIT;
-- Accounts, Auth users, real restaurants and real bookings are never targeted.
