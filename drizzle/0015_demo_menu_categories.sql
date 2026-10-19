-- Correct only explicitly isolated demo menu categories; preserve real menus.
UPDATE menu SET category='Asosiy taomlar' WHERE is_demo=1;
UPDATE menu SET category='Salatlar' WHERE is_demo=1 AND name IN ('Achchiq-chuchuk','Sezar salati','Caprese salati','Kimchi','No‘xatli salat','Yashil salat','Suzma');
UPDATE menu SET category='Sho‘rvalar' WHERE is_demo=1 AND name IN ('Tovuq ramen','Yasmiq sho‘rva','Mastava','Baliq sho‘rva');
UPDATE menu SET category='Fastfood' WHERE is_demo=1 AND name IN ('Margherita pizza','Pepperoni pizza','Fried chicken','Klassik burger','Chicken burger','Cheeseburger','Naggets','Tuxumli sendvich','Falafel','Somsa','Samosa');
UPDATE menu SET category='Garnirlar' WHERE is_demo=1 AND name IN ('Kartoshka fri','Gril sabzavot','Guruch garnir','Naan');
UPDATE menu SET category='Gazsiz ichimliklar' WHERE is_demo=1 AND name IN ('Muzli choy','Yangi sharbat','Mango lassi');
UPDATE menu SET category='Issiq ichimliklar' WHERE is_demo=1 AND name IN ('Ko‘k choy','Qora choy','Limonli choy','Kappuchino');
UPDATE menu SET category='Desertlar' WHERE is_demo=1 AND name IN ('Tiramisu','Mevali salat','Kruassan','Pankeyk','Cheesecake');
UPDATE menu SET name='Gazli limonad',category='Gazli ichimliklar' WHERE is_demo=1 AND name='Limonad';
