CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`lang` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_slug_language` ON `blog_posts` (`slug`,`lang`);
--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-booking-a-table-uz','booking-a-table','uz','Stol bron qilish: vaqt, qavat va tasdiqni tekshirish','RestaurantFoods orqali stol tanlash, boshlanish va tugash vaqtini belgilash hamda restoran tasdig‘ini tekshirish bo‘yicha qo‘llanma.','## Sana va vaqtni oldindan tanlang

Restoran sahifasida «Stol bron qilish» bo‘limini oching. Tashrif sanasi bilan birga boshlanish va tugash vaqtini ham tanlang. Barcha bron vaqtlari Samarqand vaqti (UTC+5) bo‘yicha ko‘rsatiladi. Masalan, ikki soat o‘tirishni rejalashtirsangiz, 19:00–21:00 oralig‘ini belgilang.

## Stolni reja orqali tekshiring

Mehmonlar sonini kiriting. Restoran qavatlarni qo‘shgan bo‘lsa, kerakli qavatni tanlab, stolning joylashuvi va sig‘imini ko‘ring. Boshqa vaqtga bron qilingan stolni tanlashdan oldin band vaqt oralig‘ini tekshiring. Sig‘imi guruhingizga yetadigan stolni tanlang.

## Yuborilgan so‘rov hali tasdiq emas

So‘rov yuborilgach, akkauntingizdagi «Bronlarim» bo‘limini oching. Restoran tasdiqlamaguncha joy kafolatlangan deb hisoblamang. Tashrif oldidan holatni qayta tekshiring; rejangiz o‘zgarsa, mavjud bekor qilish tugmasidan foydalaning yoki restoran bilan bog‘laning.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));

--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-booking-a-table-ru','booking-a-table','ru','Бронирование столика: время, этаж и подтверждение','Как выбрать столик и интервал посещения в RestaurantFoods и проверить подтверждение ресторана перед визитом.','## Выберите дату и интервал

Откройте раздел бронирования на странице ресторана. Укажите дату, время начала и окончания визита. Все времена бронирования указаны по Самарканду (UTC+5). Для двухчасового ужина, например, выберите 19:00–21:00.

## Проверьте план зала

Укажите число гостей. Если ресторан добавил несколько этажей, выберите нужный и посмотрите расположение столов. Проверьте вместимость конкретного стола. Стол, занятый в другое время, может быть доступен в выбранный вами интервал: ориентируйтесь на показанное расписание.

## Дождитесь подтверждения

После отправки заявки откройте «Мои брони». Отправленная заявка ещё не гарантирует место: требуется подтверждение ресторана. Перед посещением снова проверьте статус. При изменении планов воспользуйтесь доступной отменой или свяжитесь с рестораном.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));

--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-booking-a-table-en','booking-a-table','en','Booking a table: time, floor and confirmation','A practical guide to selecting a table and visit times in RestaurantFoods and checking restaurant confirmation before arrival.','## Choose a date and time window

Open the reservation section on the restaurant page. Select the date and both the start and end of your visit. Reservation times use Samarkand time (UTC+5). For a two-hour dinner, for example, choose 19:00–21:00.

## Check the floor plan

Enter your party size. If the restaurant has added multiple floors, choose a floor and inspect the table positions. Check the capacity of the individual table. A table reserved at another time may still be available for your visit; use the displayed booking intervals to decide.

## Wait for confirmation

After submitting your request, open My reservations. Sending a request does not guarantee a table: the restaurant must confirm it. Check the status again before visiting. If your plans change, use the available cancellation action or contact the restaurant.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));

--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-reading-a-menu-uz','reading-a-menu','uz','Menyuni tanlashda narx, tarkib va mavjudlikni tekshirish','Taom narxi, tarkibi, allergenlari va mavjudligini o‘rganib, savatdagi yakuniy summani tekshirish bo‘yicha amaliy maslahatlar.','## Narx va mavjudlik

Restoran menyusida taom nomi, narxi, tavsifi va mavjudlik holatini tekshiring. Narxlar UZS — O‘zbekiston so‘mida beriladi. Mavjud emas deb ko‘rsatilgan taomni tanlash o‘rniga boshqa taomni ko‘ring. Menyu restoran tomonidan yangilanadi; rasm porsiya hajmining kafolati emas.

## Tarkibni aniqlashtiring

Restoran taom tarkibi va allergenlarni kiritgan bo‘lsa, ular kartada ko‘rinadi. Maydon bo‘shligi allergen yo‘qligini bildirmaydi. Ovqatlanish cheklovingiz bo‘lsa, buyurtmadan oldin tarkib va tayyorlash sharoitini restoran bilan aniqlashtiring.

## Yakuniy summani ko‘ring

Savatda taomlar soni, ularning jami narxi va tanlangan xizmatni tekshiring. Yetkazib berish tanlansa, alohida yetkazish haqi qo‘shilishi mumkin. Tasdiqlashdan oldin yakuniy summani ko‘ring. Hozir to‘lov qabul qilishda amalga oshiriladi; onlayn to‘lov hali ulanmagan.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));

--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-reading-a-menu-ru','reading-a-menu','ru','Как читать меню: цены, состав и наличие','На что обратить внимание в карточке блюда и как проверить итоговую стоимость заказа перед подтверждением.','## Цена и наличие

Проверьте название, цену, описание и доступность блюда. Цены указаны в UZS — узбекских сумах. Если блюдо недоступно, выберите другое. Меню обновляет ресторан; фотография не гарантирует размер порции.

## Уточните состав

Если ресторан указал ингредиенты и аллергены, они отображаются в карточке. Пустое поле не означает отсутствие аллергенов. При ограничениях в питании заранее уточните состав и условия приготовления непосредственно у ресторана.

## Проверьте итог в корзине

Посмотрите количество блюд, их общую стоимость и выбранный способ получения. При доставке может добавляться отдельный сбор. Перед подтверждением проверьте итоговую сумму. Сейчас оплата производится при получении; онлайн-оплата ещё не подключена.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));

--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-reading-a-menu-en','reading-a-menu','en','Reading a menu: prices, ingredients and availability','What to check on a food card and how to review your total before confirming an order with RestaurantFoods.','## Price and availability

Check the dish name, price, description and availability. Prices are shown in UZS, Uzbek sums. Choose another dish if an item is unavailable. Restaurants maintain their menus; a photograph does not guarantee portion size.

## Clarify ingredients

Ingredients and allergens appear when supplied by the restaurant. A blank field does not mean a dish is free of allergens. If you have dietary restrictions, confirm the ingredients and preparation conditions directly with the restaurant before ordering.

## Review the cart total

Check item quantities, food subtotal and the selected fulfilment method. Delivery may add a separate fee. Review the final total before confirming. Payment is currently made on receipt; online payment is not connected yet.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));

--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-choosing-a-restaurant-uz','choosing-a-restaurant','uz','Restoran tanlash: manzil, xizmat va sharhlar','Samarqandda restoran tanlashdan oldin manzil, ish vaqti, olib ketish yoki yetkazish xizmati va sharhlarni solishtiring.','## Tashrifga mos joyni tanlang

Katalogda restoran yoki taom nomi bo‘yicha qidiring. Oshxona turi va narx filtrlaridan foydalanib variantlarni qisqartiring. Restoran sahifasida manzil va ish vaqtini tekshiring. Ma’lumot kiritilmagan bo‘lsa, restoranga qo‘ng‘iroq qilib aniqlashtiring.

## Kerakli xizmatni ajrating

Restoranda o‘tirish uchun stol bronini, o‘zingiz olib ketish uchun olib ketishni tanlang. Yetkazish faqat uni yoqqan restoranlarda mavjud. Yetkazish narxi va taxminiy vaqtiga e’tibor bering; taxminiy vaqt aniq yetib kelish kafolati emas.

## Sharh va demo belgisi

Faqat yulduzlarga emas, sharh mazmuniga ham qarang. Platformada yakunlangan bron yoki buyurtmasi bor mijoz sharh qoldirishi mumkin. DEMO bilan belgilangan restoranlar sinov uchun yaratilgan: ulardagi manzil, reyting va sharhlarni haqiqiy biznes ma’lumoti deb qabul qilmang.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));

--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-choosing-a-restaurant-ru','choosing-a-restaurant','ru','Выбор ресторана: адрес, услуги и отзывы','Сравните адрес, часы работы, способы получения заказа и отзывы перед выбором ресторана в Самарканде.','## Выберите удобное место

Ищите в каталоге по названию ресторана или блюда. Используйте фильтры кухни и цены. На странице ресторана проверьте адрес и часы работы. Если информации нет, уточните её по телефону ресторана.

## Определитесь с услугой

Для посещения зала выберите бронирование столика, а для самостоятельного получения заказа — самовывоз. Доставка доступна только у подключивших её ресторанов. Сравните сбор и ориентировочное время доставки: оценка времени не является гарантией.

## Читайте отзывы и отметки

Оценивайте содержание отзывов, а не только звёзды. Отзыв на платформе может оставить клиент с завершённым заказом или бронированием. Рестораны с отметкой DEMO созданы для тестирования: их адреса, рейтинги и отзывы не являются сведениями о настоящем бизнесе.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));

--> statement-breakpoint
INSERT OR IGNORE INTO blog_posts (id,slug,lang,title,description,content,status,created_at,updated_at) VALUES ('guide-choosing-a-restaurant-en','choosing-a-restaurant','en','Choosing a restaurant: location, services and reviews','Compare addresses, opening hours, fulfilment options and customer feedback before choosing a restaurant in Samarkand.','## Choose a convenient location

Search the directory by restaurant or dish name. Narrow the results by cuisine and price. Check the address and opening hours on the restaurant page. If information is missing, confirm it directly with the restaurant.

## Pick the service you need

Choose table reservation for a visit or pickup to collect your order yourself. Delivery is available only from restaurants that have enabled it. Compare the delivery fee and estimated time; an estimate is not a guaranteed arrival time.

## Read reviews and labels

Read the comments as well as the star rating. Customers with a completed order or reservation can review a restaurant on the platform. Restaurants labelled DEMO exist for testing: their addresses, ratings and comments are not information about real businesses.','published',strftime('%Y-%m-%dT%H:%M:%fZ','now'),strftime('%Y-%m-%dT%H:%M:%fZ','now'));
