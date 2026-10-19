-- Owner-authorized demo dataset. rf-demo-* IDs are isolated from real records.
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-01','[DEMO] Zarafshon Dasturxon','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 1','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','O‘zbek',8,4,'[]',39.655,66.961,'','09:00–23:00 (DEMO)',1,8000,35,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-01-1','rf-demo-restaurant-01','Palov',36000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-01-2','rf-demo-restaurant-01','Qozon kabob',46000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-01-3','rf-demo-restaurant-01','Manti',31000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-01-4','rf-demo-restaurant-01','Lag‘mon',23000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-01-5','rf-demo-restaurant-01','Achchiq-chuchuk',19000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-01-6','rf-demo-restaurant-01','Ko‘k choy',13000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-01-1','rf-demo-restaurant-01',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-01-2','rf-demo-restaurant-01',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-01-3','rf-demo-restaurant-01',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-01-4','rf-demo-restaurant-01',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-01-5','rf-demo-restaurant-01',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-01-6','rf-demo-restaurant-01',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-01-7','rf-demo-restaurant-01',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-01-8','rf-demo-restaurant-01',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-01-1','rf-demo-restaurant-01','rf-demo-reviewer-1',4,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-01-2','rf-demo-restaurant-01','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-01-3','rf-demo-restaurant-01','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-01-4','rf-demo-restaurant-01','rf-demo-reviewer-4',5,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-01-1','rf-demo-restaurant-01','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-01-5','rf-demo-restaurant-01','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-02','[DEMO] Silk Road Grill','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 2','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','Grill',8,4,'[]',39.656000000000006,66.96199999999999,'','09:00–23:00 (DEMO)',1,11000,45,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-02-1','rf-demo-restaurant-02','Mol go‘shti kabob',37000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-02-2','rf-demo-restaurant-02','Tovuq kabob',47000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-02-3','rf-demo-restaurant-02','Gril sabzavot',32000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-02-4','rf-demo-restaurant-02','Kartoshka fri',24000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-02-5','rf-demo-restaurant-02','Sezar salati',20000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-02-6','rf-demo-restaurant-02','Limonad',14000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-02-1','rf-demo-restaurant-02',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-02-2','rf-demo-restaurant-02',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-02-3','rf-demo-restaurant-02',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-02-4','rf-demo-restaurant-02',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-02-5','rf-demo-restaurant-02',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-02-6','rf-demo-restaurant-02',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-02-7','rf-demo-restaurant-02',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-02-8','rf-demo-restaurant-02',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-02-1','rf-demo-restaurant-02','rf-demo-reviewer-1',3,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-02-2','rf-demo-restaurant-02','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-02-3','rf-demo-restaurant-02','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-02-4','rf-demo-restaurant-02','rf-demo-reviewer-4',4,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-02-1','rf-demo-restaurant-02','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-02-5','rf-demo-restaurant-02','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-03','[DEMO] Pasta Piazza','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 3','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','Italyan',8,4,'[]',39.657000000000004,66.963,'','09:00–23:00 (DEMO)',1,14000,55,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-03-1','rf-demo-restaurant-03','Margherita pizza',38000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-03-2','rf-demo-restaurant-03','Pepperoni pizza',48000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-03-3','rf-demo-restaurant-03','Alfredo pasta',33000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-03-4','rf-demo-restaurant-03','Bolognese pasta',25000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-03-5','rf-demo-restaurant-03','Caprese salati',21000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',0);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-03-6','rf-demo-restaurant-03','Tiramisu',15000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-03-1','rf-demo-restaurant-03',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-03-2','rf-demo-restaurant-03',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-03-3','rf-demo-restaurant-03',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-03-4','rf-demo-restaurant-03',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-03-5','rf-demo-restaurant-03',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-03-6','rf-demo-restaurant-03',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-03-7','rf-demo-restaurant-03',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-03-8','rf-demo-restaurant-03',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-03-1','rf-demo-restaurant-03','rf-demo-reviewer-1',4,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-03-2','rf-demo-restaurant-03','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-03-3','rf-demo-restaurant-03','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-03-4','rf-demo-restaurant-03','rf-demo-reviewer-4',5,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-03-1','rf-demo-restaurant-03','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-03-5','rf-demo-restaurant-03','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-04','[DEMO] Seoul Garden','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 4','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','Koreys',8,4,'[]',39.658,66.964,'','09:00–23:00 (DEMO)',1,5000,65,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-04-1','rf-demo-restaurant-04','Bibimbap',39000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-04-2','rf-demo-restaurant-04','Kimbap',49000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-04-3','rf-demo-restaurant-04','Tovuq ramen',34000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-04-4','rf-demo-restaurant-04','Kimchi',26000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-04-5','rf-demo-restaurant-04','Fried chicken',22000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-04-6','rf-demo-restaurant-04','Muzli choy',16000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-04-1','rf-demo-restaurant-04',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-04-2','rf-demo-restaurant-04',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-04-3','rf-demo-restaurant-04',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-04-4','rf-demo-restaurant-04',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-04-5','rf-demo-restaurant-04',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-04-6','rf-demo-restaurant-04',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-04-7','rf-demo-restaurant-04',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-04-8','rf-demo-restaurant-04',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-04-1','rf-demo-restaurant-04','rf-demo-reviewer-1',3,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-04-2','rf-demo-restaurant-04','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-04-3','rf-demo-restaurant-04','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-04-4','rf-demo-restaurant-04','rf-demo-reviewer-4',4,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-04-1','rf-demo-restaurant-04','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-04-5','rf-demo-restaurant-04','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-05','[DEMO] Green Bowl','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 5','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','Vegetarian',8,4,'[]',39.659000000000006,66.96499999999999,'','09:00–23:00 (DEMO)',0,8000,25,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-05-1','rf-demo-restaurant-05','Sabzavotli bowl',40000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-05-2','rf-demo-restaurant-05','No‘xatli salat',50000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-05-3','rf-demo-restaurant-05','Yasmiq sho‘rva',35000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-05-4','rf-demo-restaurant-05','Falafel',27000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-05-5','rf-demo-restaurant-05','Mevali salat',23000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-05-6','rf-demo-restaurant-05','Yangi sharbat',17000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-05-1','rf-demo-restaurant-05',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-05-2','rf-demo-restaurant-05',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-05-3','rf-demo-restaurant-05',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-05-4','rf-demo-restaurant-05',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-05-5','rf-demo-restaurant-05',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-05-6','rf-demo-restaurant-05',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-05-7','rf-demo-restaurant-05',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-05-8','rf-demo-restaurant-05',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-05-1','rf-demo-restaurant-05','rf-demo-reviewer-1',4,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-05-2','rf-demo-restaurant-05','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-05-3','rf-demo-restaurant-05','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-05-4','rf-demo-restaurant-05','rf-demo-reviewer-4',5,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-05-1','rf-demo-restaurant-05','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-05-5','rf-demo-restaurant-05','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-06','[DEMO] Burger Station','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 6','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','Fast food',8,4,'[]',39.660000000000004,66.966,'','09:00–23:00 (DEMO)',1,11000,35,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-06-1','rf-demo-restaurant-06','Klassik burger',41000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-06-2','rf-demo-restaurant-06','Chicken burger',51000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-06-3','rf-demo-restaurant-06','Cheeseburger',36000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-06-4','rf-demo-restaurant-06','Kartoshka fri',28000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-06-5','rf-demo-restaurant-06','Naggets',24000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',0);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-06-6','rf-demo-restaurant-06','Limonad',18000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-06-1','rf-demo-restaurant-06',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-06-2','rf-demo-restaurant-06',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-06-3','rf-demo-restaurant-06',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-06-4','rf-demo-restaurant-06',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-06-5','rf-demo-restaurant-06',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-06-6','rf-demo-restaurant-06',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-06-7','rf-demo-restaurant-06',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-06-8','rf-demo-restaurant-06',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-06-1','rf-demo-restaurant-06','rf-demo-reviewer-1',3,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-06-2','rf-demo-restaurant-06','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-06-3','rf-demo-restaurant-06','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-06-4','rf-demo-restaurant-06','rf-demo-reviewer-4',4,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-06-1','rf-demo-restaurant-06','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-06-5','rf-demo-restaurant-06','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-07','[DEMO] Bukhara Terrace','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 7','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','O‘zbek',8,4,'[]',39.661,66.967,'','09:00–23:00 (DEMO)',1,14000,45,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-07-1','rf-demo-restaurant-07','Buxoro oshi',42000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-07-2','rf-demo-restaurant-07','Somsa',52000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-07-3','rf-demo-restaurant-07','Shashlik',37000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-07-4','rf-demo-restaurant-07','Mastava',29000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-07-5','rf-demo-restaurant-07','Suzma',25000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-07-6','rf-demo-restaurant-07','Qora choy',19000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-07-1','rf-demo-restaurant-07',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-07-2','rf-demo-restaurant-07',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-07-3','rf-demo-restaurant-07',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-07-4','rf-demo-restaurant-07',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-07-5','rf-demo-restaurant-07',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-07-6','rf-demo-restaurant-07',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-07-7','rf-demo-restaurant-07',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-07-8','rf-demo-restaurant-07',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-07-1','rf-demo-restaurant-07','rf-demo-reviewer-1',4,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-07-2','rf-demo-restaurant-07','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-07-3','rf-demo-restaurant-07','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-07-4','rf-demo-restaurant-07','rf-demo-reviewer-4',5,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-07-1','rf-demo-restaurant-07','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-07-5','rf-demo-restaurant-07','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-08','[DEMO] Ocean Table','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 8','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','Baliq',8,4,'[]',39.662000000000006,66.96799999999999,'','09:00–23:00 (DEMO)',1,5000,55,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-08-1','rf-demo-restaurant-08','Gril baliq',43000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-08-2','rf-demo-restaurant-08','Baliq sho‘rva',53000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-08-3','rf-demo-restaurant-08','Qovurilgan baliq',38000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-08-4','rf-demo-restaurant-08','Guruch garnir',30000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-08-5','rf-demo-restaurant-08','Yashil salat',26000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-08-6','rf-demo-restaurant-08','Limonli choy',20000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-08-1','rf-demo-restaurant-08',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-08-2','rf-demo-restaurant-08',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-08-3','rf-demo-restaurant-08',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-08-4','rf-demo-restaurant-08',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-08-5','rf-demo-restaurant-08',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-08-6','rf-demo-restaurant-08',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-08-7','rf-demo-restaurant-08',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-08-8','rf-demo-restaurant-08',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-08-1','rf-demo-restaurant-08','rf-demo-reviewer-1',3,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-08-2','rf-demo-restaurant-08','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-08-3','rf-demo-restaurant-08','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-08-4','rf-demo-restaurant-08','rf-demo-reviewer-4',4,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-08-1','rf-demo-restaurant-08','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-08-5','rf-demo-restaurant-08','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-09','[DEMO] Morning Bakery','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 9','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','Nonushta',8,4,'[]',39.663000000000004,66.969,'','09:00–23:00 (DEMO)',0,8000,65,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-09-1','rf-demo-restaurant-09','Omlet',44000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-09-2','rf-demo-restaurant-09','Kruassan',54000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-09-3','rf-demo-restaurant-09','Pankeyk',39000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-09-4','rf-demo-restaurant-09','Tuxumli sendvich',31000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-09-5','rf-demo-restaurant-09','Cheesecake',27000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',0);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-09-6','rf-demo-restaurant-09','Kappuchino',21000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-09-1','rf-demo-restaurant-09',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-09-2','rf-demo-restaurant-09',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-09-3','rf-demo-restaurant-09',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-09-4','rf-demo-restaurant-09',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-09-5','rf-demo-restaurant-09',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-09-6','rf-demo-restaurant-09',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-09-7','rf-demo-restaurant-09',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-09-8','rf-demo-restaurant-09',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-09-1','rf-demo-restaurant-09','rf-demo-reviewer-1',4,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-09-2','rf-demo-restaurant-09','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-09-3','rf-demo-restaurant-09','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-09-4','rf-demo-restaurant-09','rf-demo-reviewer-4',5,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-09-1','rf-demo-restaurant-09','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-09-5','rf-demo-restaurant-09','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO restaurants (id,name,owner_id,status,address,phone,description,cuisine,tables,capacity,slots,latitude,longitude,image_url,hours,delivery_enabled,delivery_fee,delivery_minutes,hall_width,hall_length,floors,booking_open,booking_close) VALUES ('rf-demo-restaurant-10','[DEMO] Spice Corner','sb:4fcd0d25-6ec1-4e10-a15f-8005d683edfe','active','DEMO — Samarqand, test manzili 10','','DEMO / ДЕМО: Bu haqiqiy restoran emas. Menyu, narxlar, manzil, reyting va sharhlar faqat saytni sinash uchun. Buyurtma va bronlar test yozuvlaridir; haqiqiy xizmat ko‘rsatilmaydi.','Hind',8,4,'[]',39.664,66.97,'','09:00–23:00 (DEMO)',1,11000,25,16,12,2,'09:00','23:00');
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-10-1','rf-demo-restaurant-10','Chicken curry',45000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-10-2','rf-demo-restaurant-10','Vegetarian curry',55000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-10-3','rf-demo-restaurant-10','Biryani',40000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Asosiy taom','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-10-4','rf-demo-restaurant-10','Naan',32000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Garnir','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-10-5','rf-demo-restaurant-10','Samosa',28000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Salat / desert','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,description,category,ingredients,allergens,available) VALUES ('rf-demo-menu-10-6','rf-demo-restaurant-10','Mango lassi',22000,'DEMO — sinov menyusi. Haqiqiy taom buyurtma qilinmaydi.','Ichimlik','','Demo: haqiqiy tarkib va allergen ma’lumoti emas.',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-10-1','rf-demo-restaurant-10',1,1,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-10-2','rf-demo-restaurant-10',2,1,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-10-3','rf-demo-restaurant-10',3,1,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-10-4','rf-demo-restaurant-10',4,1,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-10-5','rf-demo-restaurant-10',5,2,2,'Deraza yonida — DEMO',25,27,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-10-6','rf-demo-restaurant-10',6,2,4,'Oila uchun — DEMO',72,27,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-10-7','rf-demo-restaurant-10',7,2,6,'Sokin burchak — DEMO',25,72,'round',1);
--> statement-breakpoint
INSERT OR IGNORE INTO restaurant_tables (id,restaurant_id,number,floor,seats,atmosphere,x,y,shape,active) VALUES ('rf-demo-table-10-8','rf-demo-restaurant-10',8,2,8,'Guruhlar uchun — DEMO',72,72,'rect',1);
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-10-1','rf-demo-restaurant-10','rf-demo-reviewer-1',3,'DEMO: Menyu kartasi va narxlar ko‘rinishini tekshirish uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-10-2','rf-demo-restaurant-10','rf-demo-reviewer-2',4,'DEMO: Stol tanlash va bron jarayonini sinash uchun namuna.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-10-3','rf-demo-restaurant-10','rf-demo-reviewer-3',5,'DEMO: Yetkazib berish holatini ko‘rish uchun sinov sharhi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('rf-demo-review-10-4','rf-demo-restaurant-10','rf-demo-reviewer-4',4,'DEMO: Bu haqiqiy mijoz fikri emas, interfeys namunasi.','2026-10-18T15:45:00Z','2026-10-18T15:45:00Z');
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-10-1','rf-demo-restaurant-10','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'13:00','15:00',1,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
--> statement-breakpoint
INSERT OR IGNORE INTO bookings (id,restaurant_id,user_id,date,slot,end_slot,table_number,guests,phone,status,created_at) VALUES ('rf-demo-booking-10-5','rf-demo-restaurant-10','rf-demo-booking-visitor',date('now','+5 hours','+1 day'),'19:00','21:00',5,2,'','confirmed',strftime('%Y-%m-%dT%H:%M:%fZ','now'));
