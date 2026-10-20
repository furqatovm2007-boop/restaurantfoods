-- Add beverages only to the isolated menu-book pilot. Repeat-safe; never edits real menus.
INSERT OR IGNORE INTO menu (id,restaurant_id,name,price,ingredients,allergens,available,is_demo,image_url,description,category)
SELECT 'rf-demo-book-drink-'||drink.code,r.id,drink.name,drink.price,'DEMO','DEMO — tarkibni restorandan aniqlashtiring.',1,1,drink.image,'DEMO · Ichimlik namunasi. Haqiqiy buyurtma emas.',drink.category
FROM restaurants r CROSS JOIN (
 SELECT 'cola' AS code,'Cola · 330 ml' AS name,12000 AS price,'/demo-assets/drink-soda.svg' AS image,'Gazli ichimliklar' AS category
 UNION ALL SELECT 'lemonade','Gazli limonad · 330 ml',14000,'/demo-assets/drink-soda.svg','Gazli ichimliklar'
 UNION ALL SELECT 'orange','Apelsin sharbati · 250 ml',18000,'/demo-assets/drink-juice.svg','Sharbatlar'
 UNION ALL SELECT 'apple','Olma sharbati · 250 ml',16000,'/demo-assets/drink-juice.svg','Sharbatlar'
 UNION ALL SELECT 'water','Ichimlik suvi · 500 ml',6000,'/demo-assets/drink-water.svg','Gazsiz ichimliklar'
) drink WHERE r.id='rf-demo-restaurant-01' AND r.is_demo=1;
