ALTER TABLE `bookings` ADD `is_demo` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `menu` ADD `is_demo` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `is_demo` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurant_tables` ADD `is_demo` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `gallery` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `is_demo` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `is_demo` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE restaurants SET is_demo=1 WHERE id LIKE 'rf-demo-%';
--> statement-breakpoint
UPDATE menu SET is_demo=1 WHERE restaurant_id IN (SELECT id FROM restaurants WHERE is_demo=1);
--> statement-breakpoint
UPDATE restaurant_tables SET is_demo=1 WHERE restaurant_id IN (SELECT id FROM restaurants WHERE is_demo=1);
--> statement-breakpoint
UPDATE bookings SET is_demo=1 WHERE restaurant_id IN (SELECT id FROM restaurants WHERE is_demo=1);
--> statement-breakpoint
UPDATE orders SET is_demo=1 WHERE restaurant_id IN (SELECT id FROM restaurants WHERE is_demo=1);
--> statement-breakpoint
UPDATE reviews SET is_demo=1 WHERE restaurant_id IN (SELECT id FROM restaurants WHERE is_demo=1);
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-warm.jpg',gallery='["/demo-assets/room-warm.jpg", "/demo-assets/room-evening.jpg", "/demo-assets/room-bistro.jpg"]',description='DEMO — Naqshli interyer, oilaviy dasturxon va an’anaviy o‘zbek taomlari. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 1-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-01' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-evening.jpg',gallery='["/demo-assets/room-evening.jpg", "/demo-assets/room-bistro.jpg", "/demo-assets/room-modern.jpg"]',description='DEMO — Ochiq grill konsepti, yumshoq yoritilgan zal va guruhlar uchun joylar. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 2-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-02' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-bistro.jpg',gallery='["/demo-assets/room-bistro.jpg", "/demo-assets/room-modern.jpg", "/demo-assets/room-green.jpg"]',description='DEMO — Shinam italyan bistrosi: pasta, pizza va sokin suhbatlar. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 3-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-03' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-modern.jpg',gallery='["/demo-assets/room-modern.jpg", "/demo-assets/room-green.jpg", "/demo-assets/room-cafe.jpg"]',description='DEMO — Zamonaviy Osiyo oshxonasi va ixcham shaxsiy zonalar. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 4-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-04' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-green.jpg',gallery='["/demo-assets/room-green.jpg", "/demo-assets/room-cafe.jpg", "/demo-assets/room-warm.jpg"]',description='DEMO — Yashil interyer, yengil salatlar va vegetarian menyu. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 5-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-05' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-cafe.jpg',gallery='["/demo-assets/room-cafe.jpg", "/demo-assets/room-warm.jpg", "/demo-assets/room-modern.jpg"]',description='DEMO — Shahar bistrosi: burgerlar, tezkor tushlik va do‘stona muhit. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 6-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-06' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-warm.jpg',gallery='["/demo-assets/room-warm.jpg", "/demo-assets/room-modern.jpg", "/demo-assets/room-cafe.jpg"]',description='DEMO — Sharqona mehmondo‘stlik, katta guruhlar uchun dasturxon. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 7-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-07' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-modern.jpg',gallery='["/demo-assets/room-modern.jpg", "/demo-assets/room-cafe.jpg", "/demo-assets/room-evening.jpg"]',description='DEMO — Dengiz taomlari konsepti, zamonaviy zal va kechki uchrashuvlar. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 8-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-08' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-cafe.jpg',gallery='["/demo-assets/room-cafe.jpg", "/demo-assets/room-evening.jpg", "/demo-assets/room-warm.jpg"]',description='DEMO — Nonushta, yangi pishiriqlar va qahva uchun yorug‘ kafe. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 9-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-09' AND is_demo=1;
--> statement-breakpoint
UPDATE restaurants SET image_url='/demo-assets/room-evening.jpg',gallery='["/demo-assets/room-evening.jpg", "/demo-assets/room-warm.jpg", "/demo-assets/room-evening.jpg"]',description='DEMO — Xushbo‘y ziravorlar, hind oshxonasi va iliq rangli interyer. Bu test restorani: manzil, menyu, narxlar va sharhlar namunaviy. Rasmlar tasviriy; haqiqiy xizmat ko‘rsatilmaydi.',address='Samarqand · Demo kvartal, 10-bino (test manzili)',hours='Har kuni 09:00–23:00 · DEMO' WHERE id='rf-demo-restaurant-10' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Palov. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-01-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Qozon kabob. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-01-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Manti. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-01-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Lag‘mon. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-01-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-salad.jpg',description='DEMO menyu · Achchiq-chuchuk. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-01-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-coffee.jpg',description='DEMO menyu · Ko‘k choy. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-01-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Mol go‘shti kabob. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-02-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Tovuq kabob. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-02-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-salad.jpg',description='DEMO menyu · Gril sabzavot. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-02-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Kartoshka fri. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-02-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-salad.jpg',description='DEMO menyu · Sezar salati. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-02-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-coffee.jpg',description='DEMO menyu · Limonad. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-02-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-pizza.jpg',description='DEMO menyu · Margherita pizza. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-03-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-pizza.jpg',description='DEMO menyu · Pepperoni pizza. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-03-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-pasta.jpg',description='DEMO menyu · Alfredo pasta. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-03-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-pasta.jpg',description='DEMO menyu · Bolognese pasta. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-03-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-salad.jpg',description='DEMO menyu · Caprese salati. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-03-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-dessert.jpg',description='DEMO menyu · Tiramisu. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-03-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Bibimbap. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-04-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Kimbap. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-04-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Tovuq ramen. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-04-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Kimchi. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-04-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Fried chicken. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-04-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-coffee.jpg',description='DEMO menyu · Muzli choy. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-04-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-salad.jpg',description='DEMO menyu · Sabzavotli bowl. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-05-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-salad.jpg',description='DEMO menyu · No‘xatli salat. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-05-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Yasmiq sho‘rva. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-05-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Falafel. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-05-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-salad.jpg',description='DEMO menyu · Mevali salat. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-05-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-coffee.jpg',description='DEMO menyu · Yangi sharbat. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-05-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-burger.jpg',description='DEMO menyu · Klassik burger. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-06-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-burger.jpg',description='DEMO menyu · Chicken burger. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-06-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-burger.jpg',description='DEMO menyu · Cheeseburger. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-06-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Kartoshka fri. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-06-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Naggets. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-06-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-coffee.jpg',description='DEMO menyu · Limonad. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-06-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Buxoro oshi. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-07-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Somsa. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-07-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Shashlik. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-07-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Mastava. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-07-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Suzma. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-07-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-coffee.jpg',description='DEMO menyu · Qora choy. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-07-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Gril baliq. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-08-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Baliq sho‘rva. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-08-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Qovurilgan baliq. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-08-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Guruch garnir. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-08-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-salad.jpg',description='DEMO menyu · Yashil salat. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-08-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-coffee.jpg',description='DEMO menyu · Limonli choy. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-08-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Omlet. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-09-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-bread.jpg',description='DEMO menyu · Kruassan. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-09-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Pankeyk. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-09-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Tuxumli sendvich. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-09-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-dessert.jpg',description='DEMO menyu · Cheesecake. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-09-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Kappuchino. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-09-6' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-curry.jpg',description='DEMO menyu · Chicken curry. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-10-1' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-curry.jpg',description='DEMO menyu · Vegetarian curry. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-10-2' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Biryani. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-10-3' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Naan. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-10-4' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Samosa. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-10-5' AND is_demo=1;
--> statement-breakpoint
UPDATE menu SET image_url='/demo-assets/food-grill.jpg',description='DEMO menyu · Mango lassi. Porsiya va taqdimot namunasi. Surat tasviriy, haqiqiy buyurtma qabul qilinmaydi.' WHERE id='rf-demo-menu-10-6' AND is_demo=1;
--> statement-breakpoint
CREATE TRIGGER prevent_real_bookings_for_demo BEFORE INSERT ON bookings WHEN EXISTS(SELECT 1 FROM restaurants WHERE id=NEW.restaurant_id AND is_demo=1) AND NOT EXISTS(SELECT 1 FROM bookings WHERE id=NEW.id) BEGIN SELECT RAISE(ABORT,'demo_requires_isolated_booking_engine'); END;
--> statement-breakpoint
CREATE TRIGGER prevent_real_orders_for_demo BEFORE INSERT ON orders WHEN EXISTS(SELECT 1 FROM restaurants WHERE id=NEW.restaurant_id AND is_demo=1) AND NOT EXISTS(SELECT 1 FROM orders WHERE id=NEW.id) BEGIN SELECT RAISE(ABORT,'demo_requires_isolated_booking_engine'); END;


--> statement-breakpoint
CREATE TRIGGER mark_menu_demo AFTER INSERT ON menu WHEN EXISTS(SELECT 1 FROM restaurants WHERE id=NEW.restaurant_id AND is_demo=1) BEGIN UPDATE menu SET is_demo=1 WHERE id=NEW.id; END;

--> statement-breakpoint
CREATE TRIGGER mark_restaurant_tables_demo AFTER INSERT ON restaurant_tables WHEN EXISTS(SELECT 1 FROM restaurants WHERE id=NEW.restaurant_id AND is_demo=1) BEGIN UPDATE restaurant_tables SET is_demo=1 WHERE id=NEW.id; END;

--> statement-breakpoint
CREATE TRIGGER mark_reviews_demo AFTER INSERT ON reviews WHEN EXISTS(SELECT 1 FROM restaurants WHERE id=NEW.restaurant_id AND is_demo=1) BEGIN UPDATE reviews SET is_demo=1 WHERE id=NEW.id; END;
