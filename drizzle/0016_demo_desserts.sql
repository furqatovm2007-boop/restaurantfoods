-- Fill missing dessert sections in explicitly isolated demo restaurants only.
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,ingredients,allergens,available,is_demo,image_url,description,category)
SELECT 'rf-demo-dessert-'||r.id,r.id,'Cheesecake',28000,'','DEMO — tarkib va allergenlar haqiqiy emas.',1,1,'/demo-assets/food-dessert.jpg','DEMO · Dessert namunasi. Haqiqiy taom yoki buyurtma emas.','Desertlar'
FROM restaurants r WHERE r.is_demo=1 AND NOT EXISTS (SELECT 1 FROM menu m WHERE m.restaurant_id=r.id AND m.is_demo=1 AND m.category='Desertlar');
